import Component from '../dom_components/model/Component';
import DataSource from '../data_sources/model/DataSource';
import DataRecord from '../data_sources/model/DataRecord';
import Components from '../dom_components/model/Components';
import { ComponentsEvents } from '../dom_components/types';
import CssRule from '../css_composer/model/CssRule';
import CssRules from '../css_composer/model/CssRules';
import { ItemManagerModule } from '../abstract/Module';
import { Collection } from '../common';
import EditorModel from '../editor/model/Editor';
import { EditorEvents } from '../editor/types';
import { createId } from '../utils/mixins';
import { enablePatches, produceWithPatches } from 'immer';
import Asset from '../asset_manager/model/Asset';
import Page from '../pages/model/Page';
import Selector from '../selector_manager/model/Selector';
import type {
  JsonPatch,
  PatchAdapter,
  PatchAdapterChange,
  PatchAdapterEvent,
  PatchManagerConfig,
  PatchProps,
} from './types';

const encodePointer = (segment: string) => segment.replace(/~/g, '~0').replace(/\//g, '~1');
enablePatches();

export default class PatchManager extends ItemManagerModule {
  storageKey = '';
  isEnabled = false;
  private debug = false;
  private isReady = false;
  private cssRules?: CssRules;

  private history: PatchProps[] = [];
  private index = -1;
  private active: PatchProps | null = null;
  private coalesceTimer?: ReturnType<typeof setTimeout>;
  private coalesceMs = 0;
  private maxHistory = 500;
  private isApplyingExternal = false;
  private adapters = new Map<string, PatchAdapter<any>>();
  private adapterListeners: { adapter: string; target: any; event: string; handler: (...args: any[]) => void }[] = [];
  private trackingBound = false;
  private fractionalGen?: (a: string | null, b: string | null) => string;
  private dataRecordAdapter?: PatchAdapter<DataRecord>;
  private cssRulesBound = false;

  private internalSetOptions = {
    fromUndo: true,
    noUndo: true,
    avoidStore: true,
    _skipPatches: true,
  };

  private static blockedRootKeys = new Set<string>(['traits', '__data_values', 'docEl', 'head', 'toolbar']);

  constructor(em: EditorModel) {
    super(em, 'Patches', new Collection(), undefined, undefined, { skipListen: true });
  }

  onInit(): void {
    const cfg = (this.getConfig() as any) ?? {};
    const normalized = typeof cfg === 'boolean' ? { enable: cfg } : cfg;
    this.init({ enable: true, ...normalized });
    this.registerDefaultAdapters();
    this.setupTracking();
  }

  init(cfg: PatchManagerConfig = {}) {
    this.isEnabled = !!cfg.enable;
    this.maxHistory = cfg.maxHistory ?? this.maxHistory;
    this.coalesceMs = cfg.coalesceMs ?? 0;
    this.debug = cfg.debug ?? false;
    return this;
  }

  private registerDefaultAdapters() {
    this.registerAdapter(this.createComponentAdapter());
    this.registerAdapter(this.createCssRuleAdapter());
    this.dataRecordAdapter = this.createDataRecordAdapter();
    this.registerAdapter(this.dataRecordAdapter);
    this.registerAdapter(this.createDataSourceAdapter());
    this.registerAdapter(this.createAssetAdapter());
    this.registerAdapter(this.createPageAdapter());
    this.registerAdapter(this.createSelectorAdapter());
  }

  registerAdapter<T>(adapter: PatchAdapter<T>) {
    const normalized = this.normalizeAdapter(adapter);
    this.unbindAdapter(normalized.type);
    this.adapters.set(normalized.type, normalized);

    if (this.trackingBound) {
      this.bindAdapter(normalized);
    }

    return this;
  }

  private normalizeAdapter<T>(adapter: PatchAdapter<T>): PatchAdapter<T> {
    if (adapter.blockedKeys && !(adapter.blockedKeys instanceof Set)) {
      adapter.blockedKeys = new Set(adapter.blockedKeys);
    }
    return adapter;
  }

  private bindAdapters() {
    if (this.trackingBound) return;
    this.trackingBound = true;
    this.adapters.forEach((adapter) => this.bindAdapter(adapter));
  }

  private bindAdapter(adapter: PatchAdapter<any>) {
    adapter.events?.forEach((event) => this.bindAdapterEvent(adapter, event));
    if (this.isReady) {
      adapter.onReady?.(this);
    }
  }

  private bindAdapterEvent(adapter: PatchAdapter<any>, event: PatchAdapterEvent) {
    const target = event.target ? event.target(this) : this.em;
    if (!target?.on) return;
    const listener = (...args: any[]) => {
      const options = event.getOptions?.(...args) ?? this.extractOptions(args);
      const skipTracking = !event.skipTrackingCheck && (!this.canTrack() || this.shouldSkipOptions(options));
      if (skipTracking) return;
      const result = event.handler({ args, options });
      if (result?.patches?.length) {
        this.collect(result.patches, result.inverse || []);
      }
    };

    target.on(event.event, listener);
    this.adapterListeners.push({ adapter: adapter.type, target, event: event.event, handler: listener });
  }

  private extractOptions(args: any[]) {
    const last = args[args.length - 1];
    const beforeLast = args[args.length - 2];
    if (last && typeof last === 'object') return last;
    if (beforeLast && typeof beforeLast === 'object') return beforeLast;
  }

  private unbindAdapter(type: string) {
    const listeners = this.adapterListeners.filter((item) => item.adapter === type);
    listeners.forEach(({ target, event, handler }) => target?.off?.(event, handler));
    this.adapterListeners = this.adapterListeners.filter((item) => item.adapter !== type);
  }

  private unbindAllAdapters() {
    this.adapterListeners.forEach(({ target, event, handler }) => target?.off?.(event, handler));
    this.adapterListeners = [];
    this.trackingBound = false;
  }

  private notifyAdaptersReady() {
    if (!this.isReady) return;
    this.adapters.forEach((adapter) => adapter.onReady?.(this));
  }

  private setupTracking() {
    const { em } = this;
    this.isReady = !!em.get('readyLoad');
    this.ensureAllCssRuleIds();
    this.bindAdapters();
    this.notifyAdaptersReady();
    em.on('change:readyLoad', this.handleReadyLoad);
    em.on(EditorEvents.projectLoad, this.handleProjectLoad);
  }

  private handleReadyLoad = () => {
    if (!this.em.get('readyLoad')) return;
    this.isReady = true;
    this.ensureAllCssRuleIds();
    this.notifyAdaptersReady();
    this.resetHistory();
    this.em.off('change:readyLoad', this.handleReadyLoad);
  };

  private handleProjectLoad = () => {
    this.resetHistory();
    this.ensureAllCssRuleIds();
    this.notifyAdaptersReady();
  };

  handleChange(data: Record<string, any> = {}, opts: Record<string, any> = {}) {
    if (!this.canTrack() || this.shouldSkipOptions(opts)) return;
    const patches: JsonPatch[] = [];
    const reverse: JsonPatch[] = [];

    this.adapters.forEach((adapter) => {
      const change = this.getChangeFromData(adapter, data);
      change && this.handleAdapterChange(adapter, change, patches, reverse);
    });

    patches.length && this.collect(patches, reverse);
  }

  private getChangeFromData<T>(adapter: PatchAdapter<T>, data: Record<string, any>): PatchAdapterChange<T> | null {
    if (adapter.getChange) {
      return adapter.getChange(data);
    }
    const { sourceKeys = [] } = adapter;
    const changed = data.changed as Record<string, any> | undefined;
    if (!changed) return null;

    for (const key of sourceKeys) {
      const target = data[key] as T | undefined;
      if (target) {
        return { target, changed };
      }
    }

    return null;
  }

  private handleAdapterChange<T>(
    adapter: PatchAdapter<T>,
    change: PatchAdapterChange<T>,
    patches: JsonPatch[],
    reverse: JsonPatch[],
  ) {
    const { target, changed } = change;
    const id = adapter.getId(target);
    if (!id) return;

    Object.keys(changed).forEach((key) => {
      const filter = adapter.filterChangedKey;
      if (filter ? !filter(key) : this.isBlockedKey(key, adapter)) return;
      const nextVal = this.cloneValue(changed[key]);
      const prevVal = (target as any)?.previous ? (target as any).previous(key) : undefined;
      const pair = this.buildImmerPatchPair(adapter, `${id}`, key, prevVal, nextVal);
      patches.push(...pair.patches);
      reverse.push(...pair.inverse);
    });
  }

  private handleComponentAdd = (component: Component, opts: any = {}) => {
    const parent = component.parent();
    const collection = (component.collection || parent?.components()) as Components | undefined;
    if (!parent || !collection) return;
    const at = typeof opts.at === 'number' ? opts.at : collection.indexOf(component);
    const path = this.buildPath('component', parent.getId(), [
      'components',
      this.getComponentKey(collection, component, at),
    ]);
    const value = this.cloneValue(component.toJSON());
    const patch: JsonPatch = { op: 'add', path, value };
    const inverse: JsonPatch = { op: 'remove', path };
    return { patches: [patch], inverse: [inverse] };
  };

  private handleComponentRemove = (component: Component, opts: any = {}) => {
    const collection = (opts.collection || component.prevColl) as Components | undefined;
    const parent = component.parent({ prev: true });
    if (!parent || !collection) return;
    const index = typeof opts.index === 'number' ? opts.index : collection.indexOf(component);
    const path = this.buildPath('component', parent.getId(), [
      'components',
      this.getComponentKey(collection, component, index),
    ]);
    const reverseVal = this.cloneValue(component.toJSON());
    const patch: JsonPatch = { op: 'remove', path };
    const inverse: JsonPatch = { op: 'add', path, value: reverseVal };
    return { patches: [patch], inverse: [inverse] };
  };

  private createComponentAdapter(): PatchAdapter<Component> {
    return {
      type: 'component',
      sourceKeys: ['component'],
      blockedKeys: PatchManager.blockedRootKeys,
      getId: (component) => component.getId(),
      resolve: (em, id) => em.Components?.getById(id),
      events: [
        {
          event: ComponentsEvents.add,
          getOptions: (...args: any[]) => args[1],
          handler: ({ args }) => this.handleComponentAdd(args[0] as Component, args[1]),
        },
        {
          event: ComponentsEvents.remove,
          getOptions: (...args: any[]) => args[1],
          handler: ({ args }) => this.handleComponentRemove(args[0] as Component, args[1]),
        },
      ],
      applyPatch: (target, path, patch) => {
        if (path[0] === 'components') {
          return this.applyComponentsPatch(target, path.slice(1), patch);
        }
        return false;
      },
    };
  }

  private createCssRuleAdapter(): PatchAdapter<CssRule> {
    return {
      type: 'cssRule',
      sourceKeys: ['rule'],
      getChange: (data) => {
        const rule = data.rule as CssRule | undefined;
        const changed = data.changed as Record<string, any> | undefined;
        if (!rule || !changed) return null;
        this.ensureCssRuleId(rule);
        return { target: rule, changed };
      },
      getId: (rule) => this.ensureCssRuleId(rule),
      resolve: (em, id) => em.Css?.rules?.get(id) ?? em.Css?.get(id),
      events: [
        {
          event: 'add',
          target: () => this.getCssRules(),
          handler: ({ args }) => this.handleCssRuleAdd(args[0] as CssRule),
        },
        {
          event: 'remove',
          target: () => this.getCssRules(),
          handler: ({ args }) => this.buildAddRemovePatch('cssRule', args[0] as CssRule, 'remove'),
        },
        {
          event: 'change',
          target: () => this.getCssRules(),
          handler: ({ args }) => this.handleGenericModelChange(args[0] as CssRule, 'cssRule'),
        },
      ],
      onReady: () => this.ensureAllCssRuleIds(),
    };
  }

  private createDataRecordAdapter(): PatchAdapter<DataRecord> {
    return {
      type: 'dataRecord',
      getId: (record) => this.buildDataRecordId(record),
      resolve: (em, id) => {
        const [dsId, recId] = id.split('::');
        const ds = em.DataSources?.get(dsId);
        return ds?.records?.get(recId) || null;
      },
    };
  }

  private createDataSourceAdapter(): PatchAdapter<DataSource> {
    return {
      type: 'dataSource',
      sourceKeys: ['dataSource'],
      getId: (ds) => `${ds.id || ds.cid}`,
      resolve: (em, id) => em.DataSources?.get(id),
      events: [
        {
          event: 'add',
          target: () => this.getDataSources(),
          handler: ({ args }) => this.handleDataSourceAdd(args[0] as DataSource),
        },
        {
          event: 'remove',
          target: () => this.getDataSources(),
          handler: ({ args }) => this.handleDataSourceRemove(args[0] as DataSource),
        },
        {
          event: 'change',
          target: () => this.getDataSources(),
          handler: ({ args }) => this.handleGenericModelChange(args[0] as DataSource, 'dataSource'),
        },
      ],
      onReady: () => this.bindAllDataSourceRecords(),
    };
  }

  private createAssetAdapter(): PatchAdapter<Asset> {
    return {
      type: 'asset',
      getId: (asset) => (asset.get ? asset.get('src') : (asset as any).src),
      resolve: (em, id) => em.Assets?.get(id),
      events: [
        {
          event: 'add',
          target: () => this.getAssets(),
          handler: ({ args }) => this.handleAddRemoveCollect('asset', args[0] as Asset, 'add'),
        },
        {
          event: 'remove',
          target: () => this.getAssets(),
          handler: ({ args }) => this.handleAddRemoveCollect('asset', args[0] as Asset, 'remove'),
        },
        {
          event: 'change',
          target: () => this.getAssets(),
          handler: ({ args }) => this.handleGenericModelChange(args[0] as Asset, 'asset'),
        },
      ],
    };
  }

  private createPageAdapter(): PatchAdapter<Page> {
    return {
      type: 'page',
      getId: (page) => `${(page as any).id || page.get('id') || page.cid}`,
      resolve: (em, id) => em.Pages?.get(id),
      events: [
        {
          event: 'add',
          target: () => this.getPages(),
          handler: ({ args }) => this.handleAddRemoveCollect('page', args[0] as Page, 'add'),
        },
        {
          event: 'remove',
          target: () => this.getPages(),
          handler: ({ args }) => this.handleAddRemoveCollect('page', args[0] as Page, 'remove'),
        },
        {
          event: 'change',
          target: () => this.getPages(),
          handler: ({ args }) => this.handleGenericModelChange(args[0] as Page, 'page'),
        },
      ],
    };
  }

  private createSelectorAdapter(): PatchAdapter<Selector> {
    return {
      type: 'selector',
      getId: (sel) => (sel as any).id || (sel as any).get?.('id') || (sel as any).getFullName?.() || sel.cid,
      resolve: (em, id) => em.Selectors?.get(id),
      events: [
        {
          event: 'add',
          target: () => this.getSelectors(),
          handler: ({ args }) => this.handleAddRemoveCollect('selector', args[0] as Selector, 'add'),
        },
        {
          event: 'remove',
          target: () => this.getSelectors(),
          handler: ({ args }) => this.handleAddRemoveCollect('selector', args[0] as Selector, 'remove'),
        },
        {
          event: 'change',
          target: () => this.getSelectors(),
          handler: ({ args }) => this.handleGenericModelChange(args[0] as Selector, 'selector'),
        },
      ],
    };
  }

  private cloneValue(value: any) {
    if (typeof value === 'undefined') return value;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (err) {
      return value;
    }
  }

  private buildImmerPatchPair(adapter: PatchAdapter<any>, id: string, key: string, prevVal: any, nextVal: any) {
    const base = { value: this.cloneValue(prevVal) };
    const [, forward, backward] = produceWithPatches(base, (draft) => {
      (draft as any).value = this.cloneValue(nextVal);
    });

    return {
      patches: this.toJsonPatches(adapter, id, key, forward),
      inverse: this.toJsonPatches(adapter, id, key, backward),
    };
  }

  private toJsonPatches(adapter: PatchAdapter<any>, id: string, key: string, list: any[] = []) {
    return list
      .map((patch) => {
        const pathArr: (string | number)[] = Array.isArray(patch.path) ? patch.path : [];
        const [, ...rest] = pathArr; // drop synthetic "value" root
        const fullPath = this.buildPath(adapter.type, `${id}`, [key, ...rest]);
        if (!fullPath) return null;
        const value = typeof patch.value === 'undefined' ? undefined : this.cloneValue(patch.value);
        return patch.op === 'remove' ? { op: patch.op, path: fullPath } : { op: patch.op, path: fullPath, value };
      })
      .filter(Boolean) as JsonPatch[];
  }

  private buildAddRemovePatch(type: string, model: any, op: 'add' | 'remove') {
    if (!model) return;
    const adapter = this.adapters.get(type);
    if (!adapter) return;
    const id = adapter.getId(model);
    if (!id) return;
    const path = this.buildPath(type, `${id}`);
    const value = this.cloneValue(model.toJSON?.() || model);
    const patch: JsonPatch = op === 'add' ? { op: 'add', path, value } : { op: 'remove', path };
    const inverse: JsonPatch =
      op === 'add' ? { op: 'remove', path } : { op: 'add', path, value: this.cloneValue(model.toJSON?.() || model) };
    return { patches: [patch], inverse: [inverse] };
  }

  private handleAddRemoveCollect(type: string, model: any, op: 'add' | 'remove') {
    const res = this.buildAddRemovePatch(type, model, op);
    res && this.collect(res.patches, res.inverse || []);
    return res;
  }

  private handleGenericModelChange(model: any, adapterType: string) {
    const adapter = this.adapters.get(adapterType);
    if (!adapter) return;
    const changed = typeof model.changedAttributes === 'function' ? model.changedAttributes() : null;
    if (!changed || !Object.keys(changed).length) return;
    const patches: JsonPatch[] = [];
    const inverse: JsonPatch[] = [];
    this.handleAdapterChange(adapter, { target: model, changed }, patches, inverse);
    return { patches, inverse };
  }

  private buildDataRecordId(record: DataRecord) {
    const dsId = (record as any).dataSource?.id || (record as any).dataSource?.cid || 'ds';
    const recId = record.id || (record as any).cid;
    return `${dsId}::${recId}`;
  }

  private buildPath(type: string, id: string, segments: (string | number)[] = []) {
    const data = [type, id, ...segments.map((seg) => `${seg}`)];
    return `/${data.map(encodePointer).join('/')}`;
  }

  private getComponentKey(coll?: Components, cmp?: Component, at?: number) {
    if (!coll) return '0';
    const getFractional = (coll as any)?.getFractionalKey;
    const supportsFractional = this.supportsFractionalIndexing(coll);

    if (supportsFractional) {
      const existing = this.getExistingFractionalKey(coll, cmp);
      if (existing) return existing;
      const key = this.buildFractionalKey(coll, typeof at === 'number' ? at : cmp ? coll.indexOf(cmp) : undefined);
      if (key) return key;
    }

    if (typeof getFractional === 'function' && cmp) {
      return getFractional.call(coll, cmp);
    }

    if (typeof at === 'number') {
      return `${at}`;
    }
    const idx = cmp ? coll.indexOf(cmp) : -1;
    return `${idx >= 0 ? idx : 0}`;
  }

  private supportsFractionalIndexing(coll: any) {
    return (
      typeof coll?.findByFractionalKey === 'function' ||
      typeof coll?.setFractionalKey === 'function' ||
      typeof coll?.getIndexFromFractionalKey === 'function'
    );
  }

  private buildFractionalKey(coll: any, at?: number) {
    const gen = this.getGenerateKeyBetween();
    if (!gen) return '';
    const index = typeof at === 'number' ? at : coll?.length || 0;
    const prev = index > 0 ? coll.at(index - 1) : null;
    const next = index < coll.length ? coll.at(index) : null;
    const prevKey = this.getExistingFractionalKey(coll, prev);
    const nextKey = this.getExistingFractionalKey(coll, next);
    return gen(prevKey || null, nextKey || null) || '';
  }

  private getExistingFractionalKey(coll: any, model: any) {
    if (!model) return null;
    const getter = coll?.getFractionalKey;
    const key =
      (typeof getter === 'function' && getter.call(coll, model)) ||
      (model as any)?.fractionalKey ||
      (typeof model?.get === 'function' ? model.get('fractionalKey') : undefined);
    return key || null;
  }

  private setFractionalKey(coll: any, model: any, key: string) {
    if (!key || !model) return;
    if (typeof coll?.setFractionalKey === 'function') {
      coll.setFractionalKey(model, key);
    } else {
      (model as any).fractionalKey = key;
      typeof model?.set === 'function' && model.set('fractionalKey', key, this.internalSetOptions);
    }
  }

  private getDataSources() {
    return this.em.DataSources?.all || this.em.DataSources?.getAll?.();
  }

  private getAssets() {
    return this.em.Assets?.getAll?.();
  }

  private getPages() {
    return this.em.Pages?.getAll?.();
  }

  private getSelectors() {
    return this.em.Selectors?.getAll?.();
  }

  private bindAllDataSourceRecords() {
    const dss = this.getDataSources();
    if (!dss) return;
    dss.each((ds: DataSource) => this.bindDataSourceRecords(ds));
    if (dss.on) {
      dss.on('add', this.bindDataSourceRecords);
      this.adapterListeners.push({
        adapter: 'dataRecord',
        target: dss,
        event: 'add',
        handler: this.bindDataSourceRecords,
      });
    }
  }

  private bindDataSourceRecords = (ds: DataSource) => {
    if (!ds?.records) return;
    const recs = ds.records;
    const bind = (event: string, handler: (...args: any[]) => void) => {
      recs.on(event, handler);
      this.adapterListeners.push({ adapter: 'dataRecord', target: recs, event, handler });
    };
    bind('add', (record: DataRecord) => {
      const patch = this.buildAddRemovePatch('dataRecord', record, 'add');
      patch && this.collect(patch.patches, patch.inverse || []);
    });
    bind('remove', (record: DataRecord) => {
      const patch = this.buildAddRemovePatch('dataRecord', record, 'remove');
      patch && this.collect(patch.patches, patch.inverse || []);
    });
    bind('change', (record: DataRecord) => {
      const res = this.handleGenericModelChange(record, 'dataRecord');
      res && this.collect(res.patches, res.inverse || []);
    });
  };

  private unbindDataSourceRecords(ds: DataSource) {
    if (!ds?.records || !ds.records.off) return;
    const recs = ds.records;
    const listeners = this.adapterListeners.filter((item) => item.target === recs);
    listeners.forEach(({ event, handler }) => recs.off(event, handler));
    this.adapterListeners = this.adapterListeners.filter((item) => item.target !== recs);
  }

  private handleDataSourceAdd = (ds: DataSource) => {
    this.bindDataSourceRecords(ds);
    return this.buildAddRemovePatch('dataSource', ds, 'add');
  };

  private handleDataSourceRemove = (ds: DataSource) => {
    this.unbindDataSourceRecords(ds);
    return this.buildAddRemovePatch('dataSource', ds, 'remove');
  };

  // Lazy-load fractional-indexing to work in CJS/Jest environments without extra transpilation.
  private getGenerateKeyBetween() {
    if (this.fractionalGen) return this.fractionalGen;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('fractional-indexing');
      this.fractionalGen = mod?.generateKeyBetween || mod?.default?.generateKeyBetween || mod?.default;
    } catch (err) {
      this.fractionalGen = undefined;
    }
    return this.fractionalGen;
  }

  private resetHistory() {
    this.coalesceTimer && clearTimeout(this.coalesceTimer);
    this.coalesceTimer = undefined;
    this.active = null;
    this.history = [];
    this.index = -1;
  }

  canTrack() {
    return this.isEnabled && this.isReady && !this.isApplyingExternal;
  }

  beginBatch(meta?: Record<string, any>) {
    if (!this.canTrack()) return;
    if (!this.active) {
      this.active = { id: createId(), ts: Date.now(), changes: [], reverseChanges: [], meta };
      this.em.trigger('patch:batch:start', this.active);
    }
  }

  endBatch() {
    if (!this.canTrack() || !this.active) return;
    const patch = this.active;

    this.active = null;
    if (patch.changes.length === 0 && patch.reverseChanges.length === 0) return;

    if (this.index < this.history.length - 1) {
      this.history = this.history.slice(0, this.index + 1);
    }

    this.history.push(patch);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.index++;
    }

    this.em.trigger('patch:update', { patch });
    if (this.debug) {
      this.logWithEditor('update', patch);
    }
  }

  update(fn: () => void, meta?: Record<string, any>) {
    if (!this.canTrack()) return fn();

    const alreadyActive = !!this.active;

    if (!alreadyActive) this.beginBatch(meta);

    try {
      fn();
    } finally {
      if (!alreadyActive) {
        if (this.coalesceMs > 0) {
          if (this.coalesceTimer) clearTimeout(this.coalesceTimer);
          this.coalesceTimer = setTimeout(() => this.endBatch(), this.coalesceMs);
        } else {
          this.endBatch();
        }
      }
    }
  }

  collect(changes: JsonPatch[], inverse: JsonPatch[]) {
    if (!this.canTrack()) return;

    const startedHere = !this.active;
    if (startedHere) this.beginBatch();
    this.active!.changes.push(...changes);
    this.active!.reverseChanges.unshift(...inverse);
    if (startedHere) {
      if (this.coalesceMs > 0) {
        if (this.coalesceTimer) clearTimeout(this.coalesceTimer);
        this.coalesceTimer = setTimeout(() => this.endBatch(), this.coalesceMs);
      } else {
        this.endBatch();
      }
    }
  }

  apply(patch: PatchProps) {
    if (!this.isEnabled) return;
    this.isApplyingExternal = true;
    try {
      this.applyJsonPatchList(patch.changes);
      this.em.trigger('patch:applied:external', { patch });
      if (this.debug) {
        this.logWithEditor('applied external', patch);
      }
    } finally {
      this.isApplyingExternal = false;
    }
  }

  undo() {
    if (!this.canTrack() || this.index < 0) return;
    const patch = this.history[this.index];

    this.isApplyingExternal = true;
    try {
      this.applyJsonPatchList(patch.reverseChanges);
    } finally {
      this.isApplyingExternal = false;
    }
    this.index--;
    this.em.trigger('patch:undo', { patch });
  }

  redo() {
    if (!this.canTrack() || this.index >= this.history.length - 1) return;
    const patch = this.history[this.index + 1];
    this.isApplyingExternal = true;
    try {
      this.applyJsonPatchList(patch.changes);
    } finally {
      this.isApplyingExternal = false;
    }
    this.index++;
    this.em.trigger('patch:redo', { patch });
  }

  private applyJsonPatchList(list: JsonPatch[]) {
    for (const p of list) {
      try {
        this.applyJsonPatch(p);
      } catch (e) {
        if (this.debug) {
          this.logWithEditor('apply error', { patch: p } as any);
        }
      }
    }
  }

  private applyJsonPatch(p: JsonPatch) {
    const seg = p.path.split('/').filter(Boolean);
    const [objectType, objectId, ...rest] = seg;
    const adapter = objectType ? this.adapters.get(objectType) : null;
    const target = objectType && objectId && adapter ? adapter.resolve(this.em, objectId) : null;

    if (this.debug) {
      console.log('[PatchManager] applyJsonPatch', {
        p,
        objectType,
        objectId,
        rest,
        adapter: adapter?.type,
        resolved: !!target,
      });
    }

    if (!objectType || !objectId || !adapter || !target) return;

    if (adapter.applyPatch && adapter.applyPatch(target, rest, p)) {
      return;
    }

    switch (p.op) {
      case 'add':
      case 'replace':
        this.setByPath(target, rest, p.value, adapter);
        break;
      case 'remove':
        this.deleteByPath(target, rest, adapter);
        break;
      case 'move':
        this.handleMove(target, seg, p);
        break;
    }
  }

  private applyComponentsPatch(target: any, path: string[], patch: JsonPatch) {
    const coll = this.getComponentsCollection(target);
    if (!coll) return false;
    const [key] = path;
    if (!key) return false;

    switch (patch.op) {
      case 'remove': {
        const model = this.findComponentByKey(coll, key);
        model && coll.remove(model, { ...this.internalSetOptions });
        return true;
      }
      case 'add':
      case 'replace': {
        const index = this.resolveComponentIndex(coll, key);
        const opts = { ...this.internalSetOptions, at: index };
        const existing = this.findComponentByKey(coll, key);
        existing && coll.remove(existing, opts);
        if (patch.value) {
          const added = coll.add(patch.value as any, opts);
          const list = Array.isArray(added) ? added : [added];
          list.forEach((m) => this.setFractionalKey(coll, m, key));
        }
        return true;
      }
      case 'move': {
        return this.applyComponentsMove(coll, key, patch);
      }
      default:
        return false;
    }
  }

  private getComponentsCollection(target: any) {
    return typeof target?.components === 'function' ? target.components() : null;
  }

  private findComponentByKey(coll: any, key: string) {
    if (!coll) return null;
    const byId = coll.getById?.(key) || coll.get?.(key);
    if (byId) return byId;
    if (typeof coll.findByFractionalKey === 'function' && isNaN(Number(key))) {
      return coll.findByFractionalKey(key);
    }
    if (isNaN(Number(key))) {
      return coll.find((m: any) => this.getExistingFractionalKey(coll, m) === key) || null;
    }
    const idx = Number(key);
    return Number.isNaN(idx) ? null : coll.at(idx);
  }

  private resolveComponentIndex(coll: any, key: string) {
    if (typeof coll.getIndexFromFractionalKey === 'function') {
      return coll.getIndexFromFractionalKey(key);
    }
    const idx = Number(key);
    if (!Number.isNaN(idx)) return idx;
    const model = this.findComponentByKey(coll, key);
    return model ? coll.indexOf(model) : coll.length;
  }

  private applyComponentsMove(coll: any, key: string, patch: JsonPatch) {
    if (!patch.from) return false;
    const fromSeg = patch.from.split('/').filter(Boolean);
    const [fromType, fromId, fromLabel, fromKey] = fromSeg;
    if (fromLabel !== 'components' || !fromType || !fromId || !fromKey) return false;

    const fromTarget = this.resolveTarget(fromType, fromId);
    const fromColl = this.getComponentsCollection(fromTarget);
    if (!fromColl) return false;

    return this.applyComponentsMoveWithKeys(fromColl, fromKey, coll, key);
  }

  private applyComponentsMoveWithKeys(fromColl: any, fromKey: string, toColl: any, toKey: string) {
    const model = this.findComponentByKey(fromColl, fromKey);
    if (!model) return false;

    fromColl.remove(model, { ...this.internalSetOptions, temporary: true });

    const at = this.resolveComponentIndex(toColl, toKey);
    const added = toColl.add(model, { ...this.internalSetOptions, at });
    const list = Array.isArray(added) ? added : [added];
    list.forEach((m) => this.setFractionalKey(toColl, m, toKey));
    return true;
  }

  private resolveTarget(type: string, id: string): any {
    const adapter = this.adapters.get(type);
    return adapter ? adapter.resolve(this.em, id) : null;
  }

  private ensureCssRuleId(rule?: CssRule) {
    if (!rule) return '';
    const idAttr = (rule as any).idAttribute || 'id';
    let ruleId = (rule as any).id || (rule as any)[idAttr] || (rule as any).get?.(idAttr);

    if (!ruleId) {
      ruleId = createId();
      (rule as any).id = ruleId;
      typeof (rule as any).set === 'function' && rule.set(idAttr, ruleId, { silent: true });
    } else if (!(rule as any).id) {
      (rule as any).id = ruleId;
    }

    if (this.debug) {
      console.log('[PatchManager] ensureCssRuleId', ruleId, rule);
    }

    return ruleId;
  }

  private getCssRules() {
    if (!this.cssRules) {
      this.cssRules = this.em.Css?.getAll?.();
      if (this.cssRules && !this.cssRulesBound) {
        this.cssRules.on('add', this.handleCssRuleAdd);
        this.cssRulesBound = true;
      }
    }
    return this.cssRules;
  }

  private ensureAllCssRuleIds() {
    this.getCssRules()?.each((rule: CssRule) => this.ensureCssRuleId(rule));
  }

  private handleCssRuleAdd = (rule: CssRule) => {
    this.ensureCssRuleId(rule);
    const res = this.buildAddRemovePatch('cssRule', rule, 'add');
    res && this.collect(res.patches, res.inverse || []);
  };

  private isBlockedKey(key?: string, adapter?: PatchAdapter<any>) {
    if (!key) return false;
    const blocked = adapter?.blockedKeys as Set<string> | undefined;
    return !!blocked?.has(key);
  }

  private setByPath(target: any, path: string[], value: any, adapter?: PatchAdapter<any>) {
    if (!target || !path.length) return;
    const rootKey = path[0];
    if (this.isBlockedKey(rootKey, adapter)) return;

    if (typeof target.set === 'function') {
      if (path.length === 1) {
        target.set({ [rootKey]: value }, this.internalSetOptions);
      } else {
        const leafKey = path[path.length - 1];
        const baseKeys = path.slice(0, -1);
        const baseKeyPath = baseKeys.join('.');
        let subtree = target.get(baseKeyPath) ?? target.get(baseKeys[0]) ?? {};
        const clone = Array.isArray(subtree) ? [...subtree] : { ...subtree };
        let ref = clone as any;
        for (let i = 0; i < baseKeys.length - 1; i++) {
          const k = baseKeys[i + 1];
          const next = ref[k];
          if (next && typeof next === 'object') {
            ref[k] = Array.isArray(next) ? [...next] : { ...next };
          } else if (typeof next === 'undefined') {
            ref[k] = {};
          }
          ref = ref[k];
        }
        ref[leafKey] = value;
        if (baseKeys.length > 1) {
          target.set(baseKeyPath, clone, this.internalSetOptions);
        } else {
          target.set(baseKeys[0], clone, this.internalSetOptions);
        }
      }
      return;
    }

    let ref = target as any;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (ref[key] == null || typeof ref[key] !== 'object') {
        ref[key] = {};
      }
      ref = ref[key];
    }
    ref[path[path.length - 1]] = value;
  }

  private deleteByPath(target: any, path: string[], adapter?: PatchAdapter<any>) {
    if (!target || !path.length) return;
    const rootKey = path[0];
    if (this.isBlockedKey(rootKey, adapter)) return;

    if (typeof target.unset === 'function' && path.length === 1) {
      target.unset(rootKey, this.internalSetOptions);
      return;
    }
    let ref = target as any;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!ref[key] || typeof ref[key] !== 'object') return;
      ref = ref[key];
    }
    delete ref[path[path.length - 1]];
  }

  private handleMove(target: any, seg: string[], p: JsonPatch) {
    const [fromType, fromId, fromLabel, fromKey] = (p.from || '').split('/').filter(Boolean);
    const [, , toLabel, toKey] = seg;

    if (fromLabel === 'components' && toLabel === 'components') {
      const toColl = this.getComponentsCollection(target);
      const fromTarget = this.resolveTarget(fromType, fromId);
      const fromColl = this.getComponentsCollection(fromTarget);
      if (!toColl || !fromColl) return;
      this.applyComponentsMoveWithKeys(fromColl, fromKey, toColl, toKey);
    }
  }

  destroy(): void {
    this.unbindAllAdapters();
    this.em?.off('change:readyLoad', this.handleReadyLoad);
    this.em?.off(EditorEvents.projectLoad, this.handleProjectLoad);
    this.resetHistory();
    this.isApplyingExternal = false;
    super.__destroy?.();
  }

  private shouldSkipOptions(opts: Record<string, any> = {}) {
    return opts._skipPatches || opts.avoidStore || opts.noUndo || opts.partial || opts.temporary || opts.fromUndo;
  }

  private logWithEditor(eventName: string, patch: PatchProps) {
    try {
      this.em.log(`[Patches] ${eventName}`, {
        ns: 'patches',
        level: 'debug',
        patch,
      });
    } catch {}
  }
}
