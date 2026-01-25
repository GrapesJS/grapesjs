import { generateNKeysBetween } from '../utils/fractionalIndex';
import { AddOptions, Collection, Model } from '../common';
import EditorModel from '../editor/model/Editor';
import PatchManager, { PatchChangeProps, PatchPath } from './index';

export interface CollectionWithPatchesOptions extends AddOptions {
  em?: EditorModel;
  collectionId?: string;
  patchObjectType?: string;
  trackOrder?: boolean;
}

export type FractionalEntry<T extends Model = Model> = {
  id: string;
  key: string;
  model?: T | undefined;
};

type PendingRemoval = {
  oldKey: string;
  patch: any;
  change: PatchChangeProps;
  reverse: PatchChangeProps;
};

export default class CollectionWithPatches<T extends Model = Model> extends Collection<T> {
  em?: EditorModel;
  collectionId?: string;
  patchObjectType?: string;
  private fractionalMap: Record<string, string> = {};
  private pendingRemovals: Record<string, PendingRemoval> = {};
  private suppressSortRebuild = false;
  private isResetting = false;
  private trackOrder = true;

  constructor(models?: any, options: CollectionWithPatchesOptions = {}) {
    const nextOptions = { ...options };
    super(models, nextOptions);
    this.em = nextOptions.em;
    this.collectionId = nextOptions.collectionId;
    this.patchObjectType = nextOptions.patchObjectType;
    this.trackOrder = nextOptions.trackOrder !== false;

    if (this.trackOrder) {
      this.on('sort', this.handleSort, this);
      this.rebuildFractionalMap(false);
    }

    // Ensure tracking/registry works for apply(external) in enabled mode.
    Promise.resolve().then(() => {
      const pm = this.patchManager;
      const id = this.getPatchCollectionId();
      if (pm?.isEnabled && this.patchObjectType && id != null) {
        pm.trackCollection?.(this as any);
      }
    });
  }

  get patchManager(): PatchManager | undefined {
    const pm = (this.em as any)?.Patches as PatchManager | undefined;
    return pm?.isEnabled && this.patchObjectType ? pm : undefined;
  }

  setCollectionId(id: string) {
    this.collectionId = id;
  }

  add(model: T | {}, options?: CollectionWithPatchesOptions): T;
  add(models: Array<T | {}>, options?: CollectionWithPatchesOptions): T[];
  add(models: any, options?: CollectionWithPatchesOptions): any {
    const result = super.add(models, this.withEmOptions(options) as any);
    this.trackOrder && !this.isResetting && this.assignKeysForMissingModels();
    return result as any;
  }

  remove(model: T | {}, options?: any): T;
  remove(models: Array<T | {}>, options?: any): T[];
  remove(models: any, options?: any): any {
    const removed = super.remove(models, options as any);
    if (!this.trackOrder) return removed;

    const removedModels = Array.isArray(removed) ? removed : removed ? [removed] : [];
    removedModels.forEach((model) => {
      const id = this.getModelId(model as any);
      if (!id) return;
      const oldKey = this.fractionalMap[id];
      if (oldKey == null) return;

      delete this.fractionalMap[id];
      const pending = this.recordFractionalPatch(id, undefined, oldKey);
      if (pending) {
        this.pendingRemovals[id] = pending;
        Promise.resolve().then(() => {
          // Cleanup in case it was not re-added in the same tick.
          if (this.pendingRemovals[id]) {
            delete this.pendingRemovals[id];
          }
        });
      }
    });

    return removed;
  }

  reset(models?: any, options?: CollectionWithPatchesOptions) {
    this.isResetting = true;
    try {
      const result = super.reset(models, this.withEmOptions(options) as any);
      if (this.trackOrder) {
        this.fractionalMap = {};
        this.pendingRemovals = {};
        this.rebuildFractionalMap();
      }
      return result;
    } finally {
      this.isResetting = false;
    }
  }

  protected handleSort(_collection?: any, options: any = {}) {
    if (!this.trackOrder) return;
    if (this.suppressSortRebuild || options?.fromPatches) return;
    this.rebuildFractionalMap();
  }

  protected getPatchCollectionId(): string | undefined {
    return this.collectionId;
  }

  protected withEmOptions(options?: CollectionWithPatchesOptions) {
    const nextOptions = options ? { ...options } : {};
    if (this.em && nextOptions.em == null) {
      nextOptions.em = this.em;
    }
    return nextOptions;
  }

  protected rebuildFractionalMap(record: boolean = true) {
    if (!this.trackOrder) return;
    const ids = this.models.map((model) => this.getModelId(model)).filter(Boolean);
    const keys = ids.length ? generateNKeysBetween(null, null, ids.length) : [];
    const prevMap = { ...this.fractionalMap };
    const nextMap: Record<string, string> = {};

    ids.forEach((id, index) => {
      const key = keys[index];
      nextMap[id] = key;
      if (record) {
        this.recordFractionalPatch(id, key, prevMap[id]);
      }
    });

    if (record) {
      Object.keys(prevMap).forEach((id) => {
        if (!(id in nextMap)) {
          this.recordFractionalPatch(id, undefined, prevMap[id]);
        }
      });
    }

    this.fractionalMap = nextMap;
  }

  protected assignKeysForMissingModels() {
    if (!this.trackOrder) return;
    let idx = 0;
    const models = this.models;

    while (idx < models.length) {
      const model = models[idx];
      const id = this.getModelId(model);

      if (!id || this.fractionalMap[id]) {
        idx++;
        continue;
      }

      const segmentIds: string[] = [];
      const segmentStartIdx = idx;

      while (idx < models.length) {
        const segId = this.getModelId(models[idx]);
        if (!segId || this.fractionalMap[segId]) break;
        segmentIds.push(segId);
        idx++;
      }

      // Find previous and next keys around the segment, based on current collection order.
      let prevKey: string | null = null;
      for (let i = segmentStartIdx - 1; i >= 0; i--) {
        const prevId = this.getModelId(models[i]);
        if (prevId && this.fractionalMap[prevId]) {
          prevKey = this.fractionalMap[prevId];
          break;
        }
      }

      let nextKey: string | null = null;
      for (let i = idx; i < models.length; i++) {
        const nextId = this.getModelId(models[i]);
        if (nextId && this.fractionalMap[nextId]) {
          nextKey = this.fractionalMap[nextId];
          break;
        }
      }

      const keys = generateNKeysBetween(prevKey, nextKey, segmentIds.length);
      segmentIds.forEach((segId, i) => {
        const newKey = keys[i];
        this.fractionalMap[segId] = newKey;

        const pending = this.pendingRemovals[segId];
        if (pending) {
          this.removeRecordedPatch(pending);
          delete this.pendingRemovals[segId];
          this.recordFractionalPatch(segId, newKey, pending.oldKey);
        } else {
          this.recordFractionalPatch(segId, newKey, undefined);
        }
      });
    }
  }

  protected getModelId(model: T): string {
    if (!model) return '';
    if (typeof (model as any).getId === 'function') {
      const id = (model as any).getId();
      const valid = typeof id === 'string' ? id !== '' : typeof id === 'number';
      return valid ? String(id) : '';
    }
    const id = (model as any).get?.('id');
    return (id as string) || model.cid || '';
  }

  protected recordFractionalPatch(id: string, newKey?: string, oldKey?: string): PendingRemoval | void {
    const pm = this.patchManager;
    const objectType = this.patchObjectType;
    const collectionId = this.getPatchCollectionId();
    if (!pm || !pm.isEnabled || !objectType || !collectionId) return;
    if (newKey === oldKey) return;

    const path: PatchPath = [objectType, collectionId, 'order', id];
    let change: PatchChangeProps;
    let reverse: PatchChangeProps;

    if (newKey === undefined) {
      change = { op: 'remove', path };
      reverse = { op: 'add', path, value: oldKey };
    } else if (oldKey === undefined) {
      change = { op: 'add', path, value: newKey };
      reverse = { op: 'remove', path };
    } else {
      change = { op: 'replace', path, value: newKey };
      reverse = { op: 'replace', path, value: oldKey };
    }

    const patch = pm.createOrGetCurrentPatch();
    patch.changes.push(change);
    // Reverse changes should be applied in reverse order.
    patch.reverseChanges.unshift(reverse);

    if (newKey === undefined && oldKey != null) {
      return { oldKey, patch, change, reverse };
    }
  }

  getAndSortFractionalMap(): FractionalEntry<T>[] {
    return Object.entries(this.fractionalMap)
      .sort(([idA, keyA], [idB, keyB]) => keyA.localeCompare(keyB) || idA.localeCompare(idB))
      .map(([id, key]) => ({ id, key, model: this.getModelByPatchId(id) }));
  }

  getOrderKey(id: string) {
    return this.fractionalMap[id];
  }

  applyOrderKeyPatch(id: string, op: PatchChangeProps['op'], value?: string) {
    if (!id) return;

    if (op === 'remove') {
      delete this.fractionalMap[id];
      const model = this.getModelByPatchId(id);
      model && Collection.prototype.remove.call(this, model as any);
      return;
    }

    if (op === 'add' || op === 'replace') {
      if (value == null) return;
      this.fractionalMap[id] = value;
      this.sortByFractionalOrder();
    }
  }

  protected sortByFractionalOrder() {
    const entries = this.getAndSortFractionalMap();
    const sorted = entries.map((e) => e.model).filter(Boolean) as T[];
    if (!sorted.length) return;

    const included = new Set(sorted.map((m) => m.cid));
    const leftovers = this.models.filter((m) => !included.has(m.cid));
    const nextModels = [...sorted, ...leftovers];

    this.suppressSortRebuild = true;
    try {
      this.models.splice(0, this.models.length, ...nextModels);
      this.trigger('sort', this, { fromPatches: true });
    } finally {
      this.suppressSortRebuild = false;
    }
  }

  private removeRecordedPatch(pending: PendingRemoval) {
    const patch = pending.patch;
    const changeIdx = patch?.changes?.indexOf?.(pending.change);
    if (changeIdx >= 0) patch.changes.splice(changeIdx, 1);
    const reverseIdx = patch?.reverseChanges?.indexOf?.(pending.reverse);
    if (reverseIdx >= 0) patch.reverseChanges.splice(reverseIdx, 1);
  }

  private getModelByPatchId(id: string): T | undefined {
    return this.models.find((model) => this.getModelId(model) === id);
  }
}
