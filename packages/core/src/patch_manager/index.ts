import Component from '../dom_components/model/Component';
import Components from '../dom_components/model/Components';
import { ComponentsEvents } from '../dom_components/types';
import CssRule from '../css_composer/model/CssRule';
import CssRules from '../css_composer/model/CssRules';
import { ItemManagerModule } from '../abstract/Module';
import { Collection } from '../common';
import EditorModel from '../editor/model/Editor';
import { EditorEvents } from '../editor/types';
import { createId } from '../utils/mixins';
import type { JsonPatch, PatchManagerConfig, PatchProps } from './types';

const encodePointer = (segment: string) => segment.replace(/~/g, '~0').replace(/\//g, '~1');

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
    this.setupTracking();
  }

  init(cfg: PatchManagerConfig = {}) {
    this.isEnabled = !!cfg.enable;
    this.maxHistory = cfg.maxHistory ?? this.maxHistory;
    this.coalesceMs = cfg.coalesceMs ?? 0;
    this.debug = cfg.debug ?? false;
    return this;
  }

  private setupTracking() {
    const { em } = this;
    this.cssRules = em.Css?.getAll?.();
    this.ensureAllCssRuleIds();
    this.cssRules?.on('add', this.handleCssRuleAdd);
    this.isReady = !!em.get('readyLoad');
    em.on('change:readyLoad', this.handleReadyLoad);
    em.on(EditorEvents.projectLoad, this.handleProjectLoad);
    em.on(ComponentsEvents.add, this.handleComponentAdd);
    em.on(ComponentsEvents.remove, this.handleComponentRemove);
  }

  private handleReadyLoad = () => {
    if (!this.em.get('readyLoad')) return;
    this.isReady = true;
    this.ensureAllCssRuleIds();
    this.resetHistory();
    this.em.off('change:readyLoad', this.handleReadyLoad);
  };

  private handleProjectLoad = () => {
    this.resetHistory();
    this.ensureAllCssRuleIds();
  };

  handleChange(data: Record<string, any> = {}, opts: Record<string, any> = {}) {
    if (!this.canTrack() || this.shouldSkipOptions(opts)) return;
    const patches: JsonPatch[] = [];
    const reverse: JsonPatch[] = [];
    const component = data.component as Component | undefined;
    const changed = data.changed as Record<string, any> | undefined;
    const rule = data.rule as CssRule | undefined;

    if (component && changed) {
      this.handleComponentChange(component, changed, patches, reverse);
    } else if (rule && changed) {
      this.handleRuleChange(rule, changed, patches, reverse);
    }

    if (patches.length) {
      this.collect(patches, reverse);
    }
  }

  private handleComponentChange(
    component: Component,
    changed: Record<string, any>,
    patches: JsonPatch[],
    reverse: JsonPatch[],
  ) {
    const compId = component.getId();
    Object.keys(changed).forEach((key) => {
      if (this.isBlockedRootKey(key)) return;
      const path = this.buildPath('component', compId, [key]);
      const nextVal = changed[key];
      const prevVal = component.previous ? component.previous(key) : undefined;
      const { patch, inverse } = this.buildPatchPair(path, prevVal, nextVal);
      patch && patches.push(patch);
      inverse && reverse.push(inverse);
    });
  }

  private handleRuleChange(rule: CssRule, changed: Record<string, any>, patches: JsonPatch[], reverse: JsonPatch[]) {
    const ruleId = this.ensureCssRuleId(rule);

    Object.keys(changed).forEach((key) => {
      const path = this.buildPath('cssRule', `${ruleId}`, [key]);
      const nextVal = changed[key];
      const prevVal = rule.previous ? rule.previous(key) : undefined;
      const { patch, inverse } = this.buildPatchPair(path, prevVal, nextVal);
      patch && patches.push(patch);
      inverse && reverse.push(inverse);
    });
  }

  private handleComponentAdd = (component: Component, opts: any = {}) => {
    if (!this.canTrack() || this.shouldSkipOptions(opts)) return;
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
    this.collect([patch], [inverse]);
  };

  private handleComponentRemove = (component: Component, opts: any = {}) => {
    if (!this.canTrack() || this.shouldSkipOptions(opts)) return;
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
    this.collect([patch], [inverse]);
  };

  private cloneValue(value: any) {
    if (typeof value === 'undefined') return value;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (err) {
      return value;
    }
  }

  private buildPatchPair(path: string, prevVal: any, nextVal: any) {
    const op = this.getOp(prevVal, nextVal);
    const invOp = this.getOp(nextVal, prevVal);
    const patch = op ? this.buildPatch(op, path, nextVal) : null;
    const inverse = invOp ? this.buildPatch(invOp, path, prevVal) : null;
    return { patch, inverse };
  }

  private buildPatch(op: JsonPatch['op'], path: string, value: any): JsonPatch {
    const cloned = this.cloneValue(value);
    return op === 'remove' ? { op, path } : { op, path, value: cloned };
  }

  private getOp(prevVal: any, nextVal: any): JsonPatch['op'] | null {
    if (typeof nextVal === 'undefined') return 'remove';
    return typeof prevVal === 'undefined' ? 'add' : 'replace';
  }

  private buildPath(type: string, id: string, segments: (string | number)[] = []) {
    const data = [type, id, ...segments.map((seg) => `${seg}`)];
    return `/${data.map(encodePointer).join('/')}`;
  }

  private getComponentKey(coll?: Components, cmp?: Component, at?: number) {
    const getFractional = (coll as any)?.getFractionalKey;
    if (typeof getFractional === 'function' && cmp) {
      return getFractional.call(coll, cmp);
    }
    if (typeof at === 'number') {
      return `${at}`;
    }
    const idx = coll && cmp ? coll.indexOf(cmp) : -1;
    return `${idx >= 0 ? idx : 0}`;
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
    const target = this.resolveTarget(objectType, objectId);

    if (this.debug) {
      console.log('[PatchManager] applyJsonPatch', {
        p,
        objectType,
        objectId,
        rest,
        resolved: !!target,
      });
    }

    if (!objectType || !objectId) return;
    if (!target) return;

    if (rest[0] === 'components' && this.applyComponentsPatch(target, rest.slice(1), p)) {
      return;
    }

    switch (p.op) {
      case 'add':
      case 'replace':
        this.setByPath(target, rest, p.value);
        break;
      case 'remove':
        this.deleteByPath(target, rest);
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
          list.forEach((m) => coll.setFractionalKey?.(m, key));
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
    if (typeof coll.findByFractionalKey === 'function') {
      return coll.findByFractionalKey(key);
    }
    const idx = Number(key);
    return Number.isNaN(idx) ? null : coll.at(idx);
  }

  private resolveComponentIndex(coll: any, key: string) {
    if (typeof coll.getIndexFromFractionalKey === 'function') {
      return coll.getIndexFromFractionalKey(key);
    }
    const idx = Number(key);
    return Number.isNaN(idx) ? coll.length : idx;
  }

  private applyComponentsMove(coll: any, key: string, patch: JsonPatch) {
    if (!patch.from) return false;
    const fromSeg = patch.from.split('/').filter(Boolean);
    const [fromType, fromId, fromLabel, fromKey] = fromSeg;
    if (fromLabel !== 'components' || !fromType || !fromId || !fromKey) return false;

    const fromTarget = this.resolveTarget(fromType, fromId);
    const fromColl = this.getComponentsCollection(fromTarget);
    if (!fromColl) return false;

    const model = this.findComponentByKey(fromColl, fromKey);
    if (!model) return false;

    fromColl.remove(model, { ...this.internalSetOptions, temporary: true });

    const at = this.resolveComponentIndex(coll, key);
    const added = coll.add(model, { ...this.internalSetOptions, at });
    const list = Array.isArray(added) ? added : [added];
    list.forEach((m) => coll.setFractionalKey?.(m, key));
    return true;
  }

  private resolveTarget(type: string, id: string): any {
    const { em } = this;
    switch (type) {
      case 'component':
        return em.Components?.getById(id);
      case 'cssRule':
        return em.Css?.rules?.get(id) ?? em.Css?.get(id);
      default:
        return null;
    }
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

  private handleCssRuleAdd = (rule: CssRule) => {
    this.ensureCssRuleId(rule);
  };

  private ensureAllCssRuleIds() {
    if (!this.cssRules) {
      this.cssRules = this.em.Css?.getAll?.();
      this.cssRules?.on('add', this.handleCssRuleAdd);
    }
    this.cssRules?.each((rule: CssRule) => this.ensureCssRuleId(rule));
  }

  private isBlockedRootKey(key?: string) {
    if (!key) return false;
    return PatchManager.blockedRootKeys.has(key);
  }

  private setByPath(target: any, path: string[], value: any) {
    if (!target || !path.length) return;
    const rootKey = path[0];
    if (this.isBlockedRootKey(rootKey)) return;

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

  private deleteByPath(target: any, path: string[]) {
    if (!target || !path.length) return;
    const rootKey = path[0];
    if (this.isBlockedRootKey(rootKey)) return;

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

  private handleMove(_target: any, _seg: string[], _p: JsonPatch) {}

  destroy(): void {
    this.cssRules?.off('add', this.handleCssRuleAdd);
    this.em?.off('change:readyLoad', this.handleReadyLoad);
    this.em?.off(EditorEvents.projectLoad, this.handleProjectLoad);
    this.em?.off(ComponentsEvents.add, this.handleComponentAdd);
    this.em?.off(ComponentsEvents.remove, this.handleComponentRemove);
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
