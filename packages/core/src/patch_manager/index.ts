// src/patch_manager/PatchManager.ts
import { genId } from '../utils/id';
import type { PatchProps, JsonPatch } from './types';
import { ItemManagerModule } from '../abstract/Module';
import { Collection } from '../common';
import type EditorModel from '../editor/model/Editor';

export default class PatchManager extends ItemManagerModule {
  storageKey = '';
  isEnabled = false;
  private debug = false;

  private history: PatchProps[] = [];
  private index = -1;
  private active: PatchProps | null = null;
  private coalesceTimer?: ReturnType<typeof setTimeout>;
  private coalesceMs = 0;
  private maxHistory = 500;
  private isApplyingExternal = false;

  constructor(em: EditorModel) {
    super(em, 'Patches', new Collection(), undefined, undefined, { skipListen: true });
  }

  onInit(): void {
    const cfg = (this.getConfig() as any) ?? {};
    const normalized = typeof cfg === 'boolean' ? { enable: cfg } : cfg;
    this.init(normalized);
  }

  init(cfg: { enable?: boolean; maxHistory?: number; coalesceMs?: number; debug?: boolean } = {}) {
    this.isEnabled = !!cfg.enable;
    this.maxHistory = cfg.maxHistory ?? this.maxHistory;
    this.coalesceMs = cfg.coalesceMs ?? 0;
    this.debug = cfg.debug ?? false;
    return this;
  }

  beginBatch(meta?: Record<string, any>) {
    if (!this.isEnabled) return;
    if (!this.active) {
      this.active = { id: genId(), ts: Date.now(), changes: [], reverseChanges: [], meta };
      this.em.trigger('patch:batch:start', this.active);
    }
  }

  endBatch() {
    if (!this.isEnabled || !this.active) return;
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
      try {
        // eslint-disable-next-line no-console
        console.log('[Patches] update', patch);
      } catch {}
    }
  }

  update(fn: () => void, meta?: Record<string, any>) {
    if (!this.isEnabled) return fn();
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
    if (!this.isEnabled) return;
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
        try {
          // eslint-disable-next-line no-console
          console.log('[Patches] applied external', patch);
        } catch {}
      }
    } finally {
      this.isApplyingExternal = false;
    }
  }

  undo() {
    if (!this.isEnabled || this.index < 0) return;
    const patch = this.history[this.index];
    this.applyJsonPatchList(patch.reverseChanges);
    this.index--;
    this.em.trigger('patch:undo', { patch });
  }

  redo() {
    if (!this.isEnabled || this.index >= this.history.length - 1) return;
    const patch = this.history[this.index + 1];
    this.applyJsonPatchList(patch.changes);
    this.index++;
    this.em.trigger('patch:redo', { patch });
  }

  private applyJsonPatchList(list: JsonPatch[]) {
    for (const p of list) this.applyJsonPatch(p);
  }

  private applyJsonPatch(p: JsonPatch) {
    const seg = p.path.split('/').filter(Boolean);
    const [objectType, objectId, ...rest] = seg;
    const target = this.resolveTarget(objectType, objectId);
    if (!target) return;

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

  private resolveTarget(type: string, id: string): any {
    const { em } = this;
    switch (type) {
      case 'component':
        return em.Components?.getById(id);
      case 'cssRule':
        return em.Css?.get(id);
      default:
        return null;
    }
  }

  private setByPath(target: any, path: string[], value: any) {
    if (typeof target.set === 'function') {
      if (path.length === 1) {
        target.set(path[0], value);
      } else {
        const leafKey = path[path.length - 1];
        const baseKeys = path.slice(0, -1);
        let subtree = target.get(baseKeys.join('.')) ?? target.get(baseKeys[0]) ?? {};
        subtree = { ...subtree };
        let ref = subtree as any;
        for (let i = 0; i < baseKeys.length - 1; i++) {
          const k = baseKeys[i + 1];
          ref[k] = ref[k] ?? {};
          ref = ref[k];
        }
        ref[leafKey] = value;
        if (baseKeys.length > 1) {
          target.set(baseKeys.join('.'), subtree);
        } else {
          target.set(baseKeys[0], subtree);
        }
      }
      return;
    }

    let ref = target as any;
    for (let i = 0; i < path.length - 1; i++) {
      ref = ref[path[i]] ?? (ref[path[i]] = {});
    }
    ref[path[path.length - 1]] = value;
  }

  private deleteByPath(target: any, path: string[]) {
    if (typeof target.unset === 'function' && path.length === 1) {
      target.unset(path[0]);
      return;
    }
    let ref = target as any;
    for (let i = 0; i < path.length - 1; i++) {
      if (!ref[path[i]]) return;
      ref = ref[path[i]];
    }
    delete ref[path[path.length - 1]];
  }

  private handleMove(_target: any, _seg: string[], _p: JsonPatch) {
    // TODO: implement once fractional indexing is introduced
  }

  destroy(): void {
    try {
      if (this.coalesceTimer) clearTimeout(this.coalesceTimer);
    } catch {}
    this.active = null;
    this.history = [];
    this.index = -1;
    this.isApplyingExternal = false;
    super.__destroy?.();
  }
}

