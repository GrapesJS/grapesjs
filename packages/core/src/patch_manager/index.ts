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
import { ensureUid, getUid } from '../utils/uid';
import { enablePatches, produceWithPatches } from 'immer';
import Asset from '../asset_manager/model/Asset';
import Page from '../pages/model/Page';
import Selector from '../selector_manager/model/Selector';
import type {
  JsonPatch,
  PatchManagerConfig,
  PatchObjectMap,
  PatchObjectType,
  PatchAdapter,
  PatchAdapterEvent,
  PatchAdapterChange,
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
  private objects: PatchObjectMap = {};
  private listeners: { target: any; event: string; handler: (...args: any[]) => void }[] = [];
  private trackingBound = false;
  private adaptersBound = false;
  private fractionalGen?: (a: string | null, b: string | null) => string;
  private cssRulesBound = false;
  private objectPrefixes: Record<PatchObjectType, string> = {
    component: 'cmp',
    cssRule: 'css',
    dataSource: 'ds',
    dataRecord: 'dr',
    asset: 'ast',
    page: 'page',
    selector: 'sel',
  };

  private internalSetOptions: any = {
    fromUndo: true,
    noUndo: true,
    avoidStore: true,
    _skipPatches: true,
  };

  private adapters = new Map<string, PatchAdapter<any>>();
  private adapterListeners: { adapter: string; target: any; event: string; handler: (...args: any[]) => void }[] = [];

  private static blockedRootKeys = new Set<string>(['traits', '__data_values', 'docEl', 'head', 'toolbar']);

  constructor(em: EditorModel) {
    super(em, 'Patches', new Collection(), undefined, undefined, { skipListen: true });
  }

  onInit(): void {
    const cfg = (this.getConfig() as any) ?? {};
    const normalized = typeof cfg === 'boolean' ? { enable: cfg } : cfg;
    this.init({ enable: true, ...normalized });
    this.setupTracking();
    this.bindAdapters();
  }

  init(cfg: PatchManagerConfig = {}) {
    this.isEnabled = !!cfg.enable;
    this.maxHistory = cfg.maxHistory ?? this.maxHistory;
    this.coalesceMs = cfg.coalesceMs ?? 0;
    this.debug = cfg.debug ?? false;
    return this;
  }

  private refreshObjects() {
    this.objects = {};
    this.trackExistingComponents();
    this.trackExistingCssRules();
    this.trackExistingDataSources();
    this.trackExistingAssets();
    this.trackExistingPages();
    this.trackExistingSelectors();
    this.bindAdapters();
  }

  private trackExistingComponents() {
    this.trackComponentTree(this.em.Components?.getWrapper?.());
  }

  private trackExistingCssRules() {
    this.getCssRules()?.each((rule: CssRule) => {
      this.ensureCssRuleId(rule);
      this.trackObject('cssRule', rule);
    });
  }

  private trackExistingDataSources() {
    const dss = this.getDataSources();
    dss?.each((ds: DataSource) => {
      this.trackObject('dataSource', ds);
      ds.records?.each((rec: DataRecord) => this.trackObject('dataRecord', rec));
    });
  }

  private trackExistingAssets() {
    this.getAssets()?.each((asset: Asset) => this.trackObject('asset', asset));
  }

  private trackExistingPages() {
    const pages = this.getPagesCollection();
    if (pages?.each) {
      pages.each((page: Page) => this.trackObject('page', page));
    } else {
      (this.getPagesArray() || []).forEach((page: Page) => this.trackObject('page', page));
    }
  }

  private trackExistingSelectors() {
    this.getSelectors()?.each((sel: Selector) => this.trackObject('selector', sel));
  }

  registerAdapter<T>(adapter: PatchAdapter<T>) {
    const normalized = this.normalizeAdapter(adapter);
    this.unbindAdapter(normalized.type);
    this.adapters.set(normalized.type, normalized);

    if (this.adaptersBound) {
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
    if (this.adaptersBound) return;
    this.adaptersBound = true;
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
    this.adaptersBound = false;
  }

  private trackObject(type: PatchObjectType, target: any) {
    if (!target) return '';
    let uid = '';
    if (type === 'dataRecord') {
      const ds = (target as any).dataSource;
      ds && this.trackObject('dataSource', ds);
      uid = this.getDataRecordCompositeId(target as DataRecord);
    } else {
      const prefix = this.objectPrefixes[type] || '';
      uid = ensureUid(target, 'uid', prefix);
    }
    this.objects[type] = this.objects[type] || {};
    this.objects[type]![uid] = target;
    return uid;
  }

  private getObjectId(type: PatchObjectType, target: any) {
    return type === 'dataRecord' ? this.buildDataRecordId(target as DataRecord) : this.trackObject(type, target);
  }

  private getDataRecordCompositeId(record: DataRecord) {
    const ds = (record as any).dataSource;
    const dsUid = (ds && (getUid(ds) || (ds as any).id || (ds as any).cid || this.objectPrefixes.dataSource)) || 'ds';
    const recUid = getUid(record) || ensureUid(record, 'uid', this.objectPrefixes.dataRecord);
    return `${dsUid || 'ds'}::${recUid}`;
  }

  private untrackObject(type: PatchObjectType, target: any) {
    const uid =
      type === 'dataRecord'
        ? typeof target === 'string'
          ? target
          : this.getDataRecordCompositeId(target as DataRecord)
        : typeof target === 'string'
          ? target
          : getUid(target);
    if (!uid || !this.objects[type]) return;
    delete this.objects[type]![uid];
  }

  private getTracked(type: PatchObjectType, uid: string) {
    return this.objects[type]?.[uid];
  }

  private bindTracking() {
    if (this.trackingBound) return;
    this.trackingBound = true;
    this.bindListener(this.em, ComponentsEvents.add, (...args: any[]) => {
      const opts = args[1] || {};
      if (this.shouldSkipOptions(opts)) return;
      const res = this.handleComponentAdd(args[0] as Component, opts);
      this.canTrack() && res && this.collect(res.patches, res.inverse || []);
    });
    this.bindListener(this.em, ComponentsEvents.remove, (...args: any[]) => {
      const opts = args[1] || {};
      if (this.shouldSkipOptions(opts)) return;
      const res = this.handleComponentRemove(args[0] as Component, opts);
      this.canTrack() && res && this.collect(res.patches, res.inverse || []);
    });
    this.bindCssRules();
    this.bindDataSources();
    this.bindAssets();
    this.bindPagesCollection();
    this.bindSelectorsCollection();
  }

  private bindListener(target: any, event: string, handler: (...args: any[]) => void) {
    if (!target?.on) return;
    target.on(event, handler);
    this.listeners.push({ target, event, handler });
  }

  private unbindAllListeners() {
    this.listeners.forEach(({ target, event, handler }) => target?.off?.(event, handler));
    this.listeners = [];
    this.trackingBound = false;
    this.cssRulesBound = false;
  }

  private setupTracking() {
    const { em } = this;
    this.isReady = !!em.get('readyLoad');
    this.ensureAllCssRuleIds();
    this.refreshObjects();
    this.bindTracking();
    this.bindAdapters();
    em.on('change:readyLoad', this.handleReadyLoad);
    em.on(EditorEvents.projectLoad, this.handleProjectLoad);
  }

  private handleReadyLoad = () => {
    if (!this.em.get('readyLoad')) return;
    this.isReady = true;
    this.unbindAllListeners();
    this.unbindAllAdapters();
    this.cssRules = undefined;
    this.ensureAllCssRuleIds();
    this.refreshObjects();
    this.bindTracking();
    this.bindAdapters();
    this.resetHistory();
    this.em.off('change:readyLoad', this.handleReadyLoad);
  };

  private handleProjectLoad = () => {
    this.resetHistory();
    this.unbindAllListeners();
    this.unbindAllAdapters();
    this.cssRules = undefined;
    this.ensureAllCssRuleIds();
    this.refreshObjects();
    this.bindTracking();
    this.bindAdapters();
  };

  handleChange(data: Record<string, any> = {}, opts: Record<string, any> = {}) {
    if (this.shouldSkipOptions(opts)) return;
    const ctx = this.resolveChange(data);
    const canTrack = this.canTrack();

    if (ctx) {
      const { type, target, changed, blockedKeys } = ctx;
      const uid = this.getObjectId(type, target);
      if (uid && changed && Object.keys(changed).length && canTrack) {
        const patches: JsonPatch[] = [];
        const reverse: JsonPatch[] = [];

        Object.keys(changed).forEach((key) => {
          if (blockedKeys?.has(key)) return;
          const nextVal = this.cloneValue(changed[key]);
          const prevVal = this.getPreviousValue(target, key);
          const pair = this.buildImmerPatchPair(type, `${uid}`, key, prevVal, nextVal);
          patches.push(...pair.patches);
          reverse.push(...pair.inverse);
        });

        patches.length && this.collect(patches, reverse);
      }
    }

    if (!canTrack) return;

    const adapterPatches: JsonPatch[] = [];
    const adapterInverse: JsonPatch[] = [];
    this.adapters.forEach((adapter) => {
      const change = this.getChangeFromData(adapter, data);
      change && this.handleAdapterChange(adapter, change, adapterPatches, adapterInverse);
    });
    adapterPatches.length && this.collect(adapterPatches, adapterInverse);
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
      if (filter ? !filter(key) : this.isBlockedKey(key, adapter.type)) return;
      const nextVal = this.cloneValue(changed[key]);
      const prevVal = (target as any)?.previous ? (target as any).previous(key) : undefined;
      const pair = this.buildImmerPatchPair(adapter.type, `${id}`, key, prevVal, nextVal);
      patches.push(...pair.patches);
      reverse.push(...pair.inverse);
    });
  }

  private resolveChange(data: Record<string, any>) {
    const changed = (data.changed as Record<string, any>) || undefined;
    const map: { key: string; type: PatchObjectType; blocked?: Set<string> }[] = [
      { key: 'component', type: 'component', blocked: PatchManager.blockedRootKeys },
      { key: 'rule', type: 'cssRule' },
      { key: 'dataRecord', type: 'dataRecord' },
      { key: 'dataSource', type: 'dataSource' },
      { key: 'page', type: 'page' },
      { key: 'selector', type: 'selector' },
      { key: 'asset', type: 'asset' },
    ];

    for (const item of map) {
      const target = data[item.key];
      if (target) {
        if (item.type === 'cssRule') {
          this.ensureCssRuleId(target as CssRule);
        }
        return {
          type: item.type,
          target,
          changed: changed || (typeof target.changedAttributes === 'function' ? target.changedAttributes() : null),
          blockedKeys: item.blocked,
        };
      }
    }

    return null;
  }

  private getPreviousValue(target: any, key: string) {
    return (typeof target?.previous === 'function' ? target.previous(key) : undefined) ?? undefined;
  }

  private handleComponentAdd = (component: Component, opts: any = {}) => {
    const parent = component.parent();
    const collection = (component.collection || parent?.components()) as Components | undefined;
    if (!parent || !collection) return;
    const at = typeof opts.at === 'number' ? opts.at : collection.indexOf(component);
    const parentId = this.trackObject('component', parent);
    this.trackComponentTree(component);
    const path = this.buildPath('component', parentId, ['components', this.getComponentKey(collection, component, at)]);
    const value = this.serializeValue('component', component);
    const patch: JsonPatch = { op: 'add', path, value };
    const inverse: JsonPatch = { op: 'remove', path };
    return { patches: [patch], inverse: [inverse] };
  };

  private handleComponentRemove = (component: Component, opts: any = {}) => {
    const collection = (opts.collection || component.prevColl) as Components | undefined;
    const parent = component.parent({ prev: true });
    if (!parent || !collection) return;
    const index = typeof opts.index === 'number' ? opts.index : collection.indexOf(component);
    const parentId = this.trackObject('component', parent);
    const path = this.buildPath('component', parentId, [
      'components',
      this.getComponentKey(collection, component, index),
    ]);
    const reverseVal = this.serializeValue('component', component);
    const patch: JsonPatch = { op: 'remove', path };
    const inverse: JsonPatch = { op: 'add', path, value: reverseVal };
    this.untrackComponentTree(component);
    return { patches: [patch], inverse: [inverse] };
  };

  private cloneValue(value: any) {
    if (typeof value === 'undefined') return value;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (err) {
      return value;
    }
  }

  private buildImmerPatchPair(type: string, id: string, key: string, prevVal: any, nextVal: any) {
    const base = { value: this.cloneValue(prevVal) };
    const [, forward, backward] = produceWithPatches(base, (draft) => {
      (draft as any).value = this.cloneValue(nextVal);
    });

    return {
      patches: this.toJsonPatches(type, id, key, forward),
      inverse: this.toJsonPatches(type, id, key, backward),
    };
  }

  private toJsonPatches(type: string, id: string, key: string, list: any[] = []) {
    return list
      .map((patch) => {
        const pathArr: (string | number)[] = Array.isArray(patch.path) ? patch.path : [];
        const [, ...rest] = pathArr; // drop synthetic "value" root
        const fullPath = this.buildPath(type, `${id}`, [key, ...rest]);
        if (!fullPath) return null;
        const value = typeof patch.value === 'undefined' ? undefined : this.cloneValue(patch.value);
        return patch.op === 'remove' ? { op: patch.op, path: fullPath } : { op: patch.op, path: fullPath, value };
      })
      .filter(Boolean) as JsonPatch[];
  }

  private serializeValue(type: PatchObjectType, model: any) {
    if (!model) return model;
    switch (type) {
      case 'component':
        return this.serializeComponent(model as Component);
      default:
        return this.cloneValue(model.toJSON?.() || model);
    }
  }

  private serializeComponent(component: Component) {
    const json = this.cloneValue(component.toJSON?.() || component);
    if (json && typeof json === 'object') {
      json.uid = json.uid || this.trackObject('component', component);
      const compsMap = this.buildComponentsMap(component);
      const classesMap = this.buildClassesMap(component);
      compsMap && (json.componentsMap = compsMap);
      classesMap && (json.classesMap = classesMap);
    }
    return json;
  }

  private buildComponentsMap(component: Component) {
    const coll = this.getComponentsCollection(component);
    if (!coll) return;
    const map: Record<string, string> = {};
    coll.each((child: Component, index: number) => {
      const key = this.getComponentKey(coll, child, index);
      const uid = this.trackObject('component', child);
      key && uid && this.setFractionalKey(coll, child, key);
      key && uid && (map[key] = uid);
    });
    return map;
  }

  private buildClassesMap(component: Component) {
    const classes = component.get('classes') as any;
    if (!classes?.each) return;
    const map: Record<string, string> = {};
    classes.each((cls: Selector, index: number) => {
      const key = this.getComponentKey(classes, cls as any, index);
      const uid = this.trackObject('selector', cls);
      key && uid && this.setFractionalKey(classes, cls, key);
      key && uid && (map[key] = uid);
    });
    return map;
  }

  private trackComponentTree(component?: Component | null) {
    if (!component) return;
    this.trackObject('component', component);
    this.getComponentsCollection(component)?.each((child: Component) => this.trackComponentTree(child));
  }

  private untrackComponentTree(component?: Component | null) {
    if (!component) return;
    this.untrackObject('component', component);
    this.getComponentsCollection(component)?.each((child: Component) => this.untrackComponentTree(child));
  }

  private buildAddRemovePatch(type: PatchObjectType, model: any, op: 'add' | 'remove') {
    if (!model) return;
    const id = this.getObjectId(type, model);
    if (!id) return;
    const path = this.buildPath(type, `${id}`);
    const value = this.serializeValue(type, model);
    const patch: JsonPatch = op === 'add' ? { op: 'add', path, value } : { op: 'remove', path };
    const inverse: JsonPatch =
      op === 'add' ? { op: 'remove', path } : { op: 'add', path, value: this.serializeValue(type, model) };
    op === 'remove' && this.untrackObject(type, model);
    return { patches: [patch], inverse: [inverse] };
  }

  private handleAddRemoveCollect(type: PatchObjectType, model: any, op: 'add' | 'remove') {
    const res = this.buildAddRemovePatch(type, model, op);
    res && this.collect(res.patches, res.inverse || []);
    return res;
  }

  private handleGenericModelChange(model: any, adapterType: PatchObjectType, blockedKeys?: Set<string>) {
    if (!this.canTrack()) {
      this.getObjectId(adapterType, model);
      return;
    }
    const changed = typeof model.changedAttributes === 'function' ? model.changedAttributes() : null;
    if (!changed || !Object.keys(changed).length) return;
    const uid = this.getObjectId(adapterType, model);
    const patches: JsonPatch[] = [];
    const inverse: JsonPatch[] = [];
    Object.keys(changed).forEach((key) => {
      if (blockedKeys?.has(key)) return;
      const nextVal = this.cloneValue(changed[key]);
      const prevVal = this.getPreviousValue(model, key);
      const pair = this.buildImmerPatchPair(adapterType, `${uid}`, key, prevVal, nextVal);
      patches.push(...pair.patches);
      inverse.push(...pair.inverse);
    });
    if (!patches.length && !inverse.length) return;
    return { patches, inverse };
  }

  private buildDataRecordId(record: DataRecord) {
    const ds = (record as any).dataSource;
    ds && this.trackObject('dataSource', ds);
    return this.getDataRecordCompositeId(record);
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
    return this.getPagesCollection();
  }

  private getPagesCollection() {
    return (this.em.Pages as any)?.pages || (this.em.Pages as any)?.all || null;
  }

  private getPagesArray() {
    const coll = this.getPagesCollection();
    if (coll?.models) return coll.models as Page[];
    const getAll = (this.em.Pages as any)?.getAll;
    return typeof getAll === 'function' ? getAll.call(this.em.Pages) : [];
  }

  private getSelectors() {
    return this.em.Selectors?.getAll?.();
  }

  private bindCssRules() {
    const rules = this.getCssRules();
    if (!rules || this.cssRulesBound) return;
    this.cssRulesBound = true;
    this.bindListener(rules, 'add', (rule: CssRule, _c: any, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      this.handleCssRuleAdd(rule);
    });
    this.bindListener(rules, 'remove', (rule: CssRule, _c: any, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      const res = this.buildAddRemovePatch('cssRule', rule, 'remove');
      this.canTrack() && res && this.collect(res.patches, res.inverse || []);
    });
    this.bindListener(rules, 'change', (rule: CssRule, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      const res = this.handleGenericModelChange(rule, 'cssRule');
      this.canTrack() && res && this.collect(res.patches, res.inverse || []);
    });
  }

  private bindAssets() {
    const assets = this.getAssets();
    if (!assets) return;
    this.bindListener(assets, 'add', (asset: Asset, _c: any, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      this.handleAddRemoveCollect('asset', asset, 'add');
    });
    this.bindListener(assets, 'remove', (asset: Asset, _c: any, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      this.handleAddRemoveCollect('asset', asset, 'remove');
    });
    this.bindListener(assets, 'change', (asset: Asset, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      const res = this.handleGenericModelChange(asset, 'asset');
      this.canTrack() && res && this.collect(res.patches, res.inverse || []);
    });
  }

  private bindPagesCollection() {
    const pages = this.getPagesCollection();
    if (!pages) return;
    this.bindListener(pages, 'add', (page: Page, _c: any, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      this.handleAddRemoveCollect('page', page, 'add');
    });
    this.bindListener(pages, 'remove', (page: Page, _c: any, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      this.handleAddRemoveCollect('page', page, 'remove');
    });
    this.bindListener(pages, 'change', (page: Page, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      const res = this.handleGenericModelChange(page, 'page');
      this.canTrack() && res && this.collect(res.patches, res.inverse || []);
    });
  }

  private bindSelectorsCollection() {
    const selectors = this.getSelectors();
    if (!selectors) return;
    this.bindListener(selectors, 'add', (selector: Selector, _c: any, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      this.handleAddRemoveCollect('selector', selector, 'add');
    });
    this.bindListener(selectors, 'remove', (selector: Selector, _c: any, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      this.handleAddRemoveCollect('selector', selector, 'remove');
    });
    this.bindListener(selectors, 'change', (selector: Selector, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      const res = this.handleGenericModelChange(selector, 'selector');
      this.canTrack() && res && this.collect(res.patches, res.inverse || []);
    });
  }

  private bindDataSources() {
    const dss = this.getDataSources();
    if (!dss) return;
    this.bindListener(dss, 'add', (ds: DataSource, _c: any, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      const res = this.handleDataSourceAdd(ds);
      this.canTrack() && res && this.collect(res.patches, res.inverse || []);
    });
    this.bindListener(dss, 'remove', (ds: DataSource, _c: any, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      const res = this.handleDataSourceRemove(ds);
      this.canTrack() && res && this.collect(res.patches, res.inverse || []);
    });
    this.bindListener(dss, 'change', (ds: DataSource, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      const res = this.handleGenericModelChange(ds, 'dataSource');
      this.canTrack() && res && this.collect(res.patches, res.inverse || []);
    });
    this.bindAllDataSourceRecords();
  }

  private bindAllDataSourceRecords() {
    const dss = this.getDataSources();
    if (!dss) return;
    dss.each((ds: DataSource) => this.bindDataSourceRecords(ds));
  }

  private bindDataSourceRecords = (ds: DataSource) => {
    if (!ds?.records) return;
    const recs = ds.records;
    recs.each((record: DataRecord) => this.trackObject('dataRecord', record));
    this.bindListener(recs, 'add', (record: DataRecord, _c: any, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      this.trackObject('dataRecord', record);
      const patch = this.buildAddRemovePatch('dataRecord', record, 'add');
      this.canTrack() && patch && this.collect(patch.patches, patch.inverse || []);
    });
    this.bindListener(recs, 'remove', (record: DataRecord, _c: any, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      const patch = this.buildAddRemovePatch('dataRecord', record, 'remove');
      this.canTrack() && patch && this.collect(patch.patches, patch.inverse || []);
    });
    this.bindListener(recs, 'change', (record: DataRecord, opts: any) => {
      if (this.shouldSkipOptions(opts)) return;
      const res = this.handleGenericModelChange(record, 'dataRecord');
      this.canTrack() && res && this.collect(res.patches, res.inverse || []);
    });
  };

  private unbindDataSourceRecords(ds: DataSource) {
    const recs = ds?.records;
    if (!recs?.off) return;
    const remaining: { target: any; event: string; handler: (...args: any[]) => void }[] = [];
    this.listeners.forEach((item) => {
      if (item.target === recs) {
        recs.off(item.event, item.handler);
      } else {
        remaining.push(item);
      }
    });
    this.listeners = remaining;
  }

  private handleDataSourceAdd = (ds: DataSource) => {
    this.trackObject('dataSource', ds);
    this.bindDataSourceRecords(ds);
    return this.buildAddRemovePatch('dataSource', ds, 'add');
  };

  private handleDataSourceRemove = (ds: DataSource) => {
    this.unbindDataSourceRecords(ds);
    ds.records?.each((rec: DataRecord) => this.untrackObject('dataRecord', rec));
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
    const type = objectType;
    const target = objectType && objectId ? this.resolveTarget(type, objectId) : null;

    if (this.debug) {
      console.log('[PatchManager] applyJsonPatch', {
        p,
        objectType,
        objectId,
        rest,
        resolved: !!target,
      });
    }

    if (!type || !objectId) return;

    if (this.isKnownType(type) && !rest.length && this.applyRootPatch(type as PatchObjectType, objectId, p)) {
      return;
    }

    if (!target) return;

    if (type === 'component' && rest[0] === 'components') {
      if (this.applyComponentsPatch(target, rest.slice(1), p)) {
        return;
      }
    }

    switch (p.op) {
      case 'add':
      case 'replace':
        this.setByPath(target, rest, p.value, type);
        break;
      case 'remove':
        this.deleteByPath(target, rest, type);
        break;
      case 'move':
        this.handleMove(target, seg, p);
        break;
    }
  }

  private applyRootPatch(type: PatchObjectType, objectId: string, patch: JsonPatch) {
    switch (type) {
      case 'asset':
        return this.applyCollectionRootPatch(type, objectId, this.getAssets(), patch);
      case 'page':
        return this.applyCollectionRootPatch(type, objectId, this.getPagesCollection(), patch);
      case 'selector':
        return this.applyCollectionRootPatch(type, objectId, this.getSelectors(), patch);
      case 'cssRule':
        return this.applyCssRuleRootPatch(objectId, patch);
      case 'dataSource':
        return this.applyDataSourceRootPatch(objectId, patch);
      case 'dataRecord':
        return this.applyDataRecordRootPatch(objectId, patch);
      default:
        return false;
    }
  }

  private applyCollectionRootPatch(type: PatchObjectType, objectId: string, coll: any, patch: JsonPatch) {
    if (!coll) return false;
    switch (patch.op) {
      case 'add': {
        if (!patch.value) return false;
        const value = { ...(patch.value as any), uid: objectId };
        const added = coll.add(value as any, this.internalSetOptions);
        const model = Array.isArray(added) ? added[0] : added;
        model && this.trackObject(type, model);
        return true;
      }
      case 'remove': {
        const model =
          this.getTracked(type, objectId) ||
          coll.get?.(objectId) ||
          coll.find?.((m: any) => getUid(m) === objectId || (m as any).id === objectId);
        model && coll.remove(model, { ...this.internalSetOptions });
        this.untrackObject(type, objectId);
        return !!model;
      }
      case 'replace': {
        const model = this.resolveTarget(type, objectId);
        if (!model) return false;
        if (patch.value && typeof patch.value === 'object' && typeof (model as any).set === 'function') {
          (model as any).set(patch.value, this.internalSetOptions);
        }
        return true;
      }
      default:
        return false;
    }
  }

  private applyCssRuleRootPatch(objectId: string, patch: JsonPatch) {
    const rules = this.getCssRules();
    if (!rules) return false;
    switch (patch.op) {
      case 'add': {
        if (!patch.value) return false;
        const value = { ...(patch.value as any), uid: objectId };
        const added = rules.add(value as any, this.internalSetOptions);
        const rule = Array.isArray(added) ? added[0] : added;
        rule && this.ensureCssRuleId(rule);
        rule && this.trackObject('cssRule', rule);
        return true;
      }
      case 'remove': {
        const rule = this.resolveTarget('cssRule', objectId) as CssRule | null;
        rule && rules.remove(rule, { ...this.internalSetOptions });
        this.untrackObject('cssRule', objectId);
        return !!rule;
      }
      case 'replace': {
        const rule = this.resolveTarget('cssRule', objectId) as CssRule | null;
        if (!rule) return false;
        if (patch.value && typeof patch.value === 'object' && typeof (rule as any).set === 'function') {
          (rule as any).set(patch.value, this.internalSetOptions);
        }
        return true;
      }
      default:
        return false;
    }
  }

  private applyDataSourceRootPatch(objectId: string, patch: JsonPatch) {
    const dss = this.getDataSources();
    if (!dss) return false;
    switch (patch.op) {
      case 'add': {
        if (!patch.value) return false;
        const value = { ...(patch.value as any), uid: objectId };
        const added = dss.add(value as any, this.internalSetOptions);
        const ds = Array.isArray(added) ? added[0] : added;
        if (ds) {
          this.trackObject('dataSource', ds);
          this.bindDataSourceRecords(ds);
        }
        return true;
      }
      case 'remove': {
        const ds = this.resolveTarget('dataSource', objectId) as DataSource | null;
        if (!ds) return false;
        this.unbindDataSourceRecords(ds);
        ds.records?.each((rec: DataRecord) => this.untrackObject('dataRecord', rec));
        dss.remove(ds, { ...this.internalSetOptions });
        this.untrackObject('dataSource', objectId);
        return true;
      }
      case 'replace': {
        const ds = this.resolveTarget('dataSource', objectId) as DataSource | null;
        if (!ds) return false;
        if (patch.value && typeof patch.value === 'object' && typeof (ds as any).set === 'function') {
          (ds as any).set(patch.value, this.internalSetOptions);
        }
        return true;
      }
      default:
        return false;
    }
  }

  private applyDataRecordRootPatch(objectId: string, patch: JsonPatch) {
    const [dsId, recId] = objectId.split('::');
    const ds = this.resolveTarget('dataSource', dsId) as DataSource;
    const recs = ds?.records;
    if (!recs) return false;

    switch (patch.op) {
      case 'add': {
        if (!patch.value) return false;
        const value = { ...(patch.value as any), uid: recId };
        const added = recs.add(value as any, this.internalSetOptions);
        const record = Array.isArray(added) ? added[0] : added;
        record && this.trackObject('dataRecord', record);
        return true;
      }
      case 'remove': {
        const record =
          this.getTracked('dataRecord', recId) ||
          recs.get(recId) ||
          recs.find(
            (rec: DataRecord) => getUid(rec) === recId || (rec as any).id === recId || (rec as any).cid === recId,
          );
        record && recs.remove(record, { ...this.internalSetOptions });
        this.untrackObject('dataRecord', recId);
        return !!record;
      }
      case 'replace': {
        const record = this.resolveTarget('dataRecord', objectId) as DataRecord | null;
        if (!record) return false;
        if (patch.value && typeof patch.value === 'object' && typeof (record as any).set === 'function') {
          (record as any).set(patch.value, this.internalSetOptions);
        }
        return true;
      }
      default:
        return false;
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
        model && this.untrackComponentTree(model);
        model && coll.remove(model, { ...this.internalSetOptions });
        return true;
      }
      case 'add':
      case 'replace': {
        const index = this.resolveComponentIndex(coll, key);
        const opts = { ...this.internalSetOptions, at: index };
        const existing = this.findComponentByKey(coll, key);
        existing && this.untrackComponentTree(existing);
        existing && coll.remove(existing, opts);
        if (patch.value) {
          const added = coll.add(patch.value as any, opts);
          const list = Array.isArray(added) ? added : [added];
          list.forEach((m) => {
            this.setFractionalKey(coll, m, key);
            this.trackComponentTree(m);
          });
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
    const tracked = this.getTracked(type as PatchObjectType, id);
    if (tracked) return tracked;
    const found = this.findTargetFallback(type, id);
    if (found && this.isKnownType(type)) {
      this.trackObject(type as PatchObjectType, found);
    }
    return found;
  }

  private isKnownType(type: string): type is PatchObjectType {
    return (this.objectPrefixes as any)[type];
  }

  private findTargetFallback(type: string, id: string): any {
    if (!this.isKnownType(type)) {
      const adapter = this.adapters.get(type);
      return adapter?.resolve?.(this.em, id);
    }
    switch (type) {
      case 'component':
        return this.findComponentByUid(this.em.Components?.getWrapper?.(), id);
      case 'cssRule':
        return (
          this.getCssRules()?.get(id) ||
          this.getCssRules()?.find((rule: CssRule) => getUid(rule) === id || (rule as any).id === id)
        );
      case 'dataSource':
        return (
          this.getDataSources()?.get(id) ||
          this.getDataSources()?.find((ds: DataSource) => getUid(ds) === id || (ds as any).id === id)
        );
      case 'dataRecord': {
        const [dsId, recId] = id.split('::');
        const ds = this.resolveTarget('dataSource', dsId) as DataSource;
        const recs = ds?.records;
        return (
          recs?.get(recId) ||
          recs?.find(
            (rec: DataRecord) => getUid(rec) === recId || (rec as any).id === recId || (rec as any).cid === recId,
          )
        );
      }
      case 'asset':
        return (
          this.getAssets()?.get(id) ||
          this.getAssets()?.find(
            (asset: Asset) => getUid(asset) === id || (asset as any).get?.('src') === id || (asset as any).src === id,
          )
        );
      case 'page':
        return (
          this.getPagesCollection()?.get?.(id) ||
          this.getPagesArray()?.find((page: Page) => getUid(page) === id || (page as any).id === id)
        );
      case 'selector':
        return (
          this.getSelectors()?.get(id) ||
          this.getSelectors()?.find((selector: Selector) => getUid(selector) === id || (selector as any).id === id)
        );
      default:
        return null;
    }
  }

  private findComponentByUid(cmp?: Component | null, uid?: string): Component | null {
    if (!cmp || !uid) return null;
    if (getUid(cmp) === uid) return cmp;
    const coll = this.getComponentsCollection(cmp);
    for (let i = 0; i < (coll?.length || 0); i++) {
      const child = coll?.at(i);
      const found = this.findComponentByUid(child, uid);
      if (found) return found;
    }
    return null;
  }

  private ensureCssRuleId(rule?: CssRule) {
    if (!rule) return '';
    const uid = ensureUid(rule, 'uid', this.objectPrefixes.cssRule);
    const idAttr = (rule as any).idAttribute || 'id';
    let ruleId = (rule as any).id || (rule as any)[idAttr] || (rule as any).get?.(idAttr) || uid;

    if (!ruleId) {
      ruleId = createId();
      (rule as any).id = ruleId;
      typeof (rule as any).set === 'function' && rule.set(idAttr, ruleId, { silent: true });
    } else if (!(rule as any).id) {
      (rule as any).id = ruleId;
    }

    this.trackObject('cssRule', rule);

    if (this.debug) {
      console.log('[PatchManager] ensureCssRuleId', ruleId, rule);
    }

    return ruleId;
  }

  private getCssRules() {
    if (!this.cssRules) {
      this.cssRules = this.em.Css?.getAll?.();
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

  private isBlockedKey(key?: string, type?: string) {
    if (!key) return false;
    if (type === 'component') {
      return PatchManager.blockedRootKeys.has(key);
    }
    return false;
  }

  private setByPath(target: any, path: string[], value: any, type?: string) {
    if (!target || !path.length) return;
    const rootKey = path[0];
    if (this.isBlockedKey(rootKey, type)) return;

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

  private deleteByPath(target: any, path: string[], type?: string) {
    if (!target || !path.length) return;
    const rootKey = path[0];
    if (this.isBlockedKey(rootKey, type)) return;

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
    this.unbindAllListeners();
    this.unbindAllAdapters();
    this.em?.off('change:readyLoad', this.handleReadyLoad);
    this.em?.off(EditorEvents.projectLoad, this.handleProjectLoad);
    this.resetHistory();
    this.isApplyingExternal = false;
    this.objects = {};
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
