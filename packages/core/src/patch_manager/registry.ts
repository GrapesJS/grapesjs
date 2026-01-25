import { applyPatches } from 'immer';
import { serialize } from '../utils/mixins';
import type { PatchApplyHandler, PatchApplyOptions, PatchChangeProps, PatchPath } from './index';

export type PatchUid = string | number;

export class PatchObjectsRegistry<T = any> {
  private byType: Record<string, Map<PatchUid, T>> = {};

  register(type: string, uid: PatchUid, obj: T): void {
    if (!this.byType[type]) {
      this.byType[type] = new Map();
    }

    this.byType[type].set(uid, obj);
  }

  unregister(type: string, uid: PatchUid): void {
    this.byType[type]?.delete(uid);
  }

  get(type: string, uid: PatchUid): T | undefined {
    return this.byType[type]?.get(uid);
  }

  clear(type?: string): void {
    if (type) {
      delete this.byType[type];
      return;
    }

    this.byType = {};
  }
}

type PatchGroup = {
  type: string;
  uid: PatchUid;
  patches: PatchChangeProps[];
};

const getPatchGroupKey = (type: string, uid: PatchUid) => `${type}::${uid}`;

const stripPrefix = (path: PatchPath, prefixLen: number): PatchPath => path.slice(prefixLen);

const normalizeForApply = (patch: PatchChangeProps): PatchChangeProps => {
  const prefixLen = 3; // [type, uid, 'attributes', ...]
  return {
    ...patch,
    path: stripPrefix(patch.path, prefixLen),
    ...(patch.from ? { from: stripPrefix(patch.from, prefixLen) } : {}),
  };
};

const syncModelToState = (model: any, state: any, options?: PatchApplyOptions) => {
  const current = model.attributes || {};
  Object.keys(current).forEach((key) => {
    if (!(key in state)) {
      model.unset(key, options as any);
    }
  });

  model.set(state, options as any);
};

export const createRegistryApplyPatchHandler = (registry: PatchObjectsRegistry): PatchApplyHandler => {
  return (changes: PatchChangeProps[], options?: PatchApplyOptions) => {
    const groups = new Map<string, PatchGroup>();

    changes.forEach((patch) => {
      const [type, uid, scope] = patch.path;
      if (typeof type !== 'string' || (typeof uid !== 'string' && typeof uid !== 'number')) return;
      if (scope !== 'attributes') return;

      const key = getPatchGroupKey(type, uid);
      const group = groups.get(key) || { type, uid, patches: [] };
      group.patches.push(patch);
      groups.set(key, group);
    });

    groups.forEach(({ type, uid, patches }) => {
      const model = registry.get(type, uid);
      if (!model) return;

      const baseState = serialize(model.attributes || {});
      const nextState = applyPatches(baseState, patches.map(normalizeForApply) as any);
      syncModelToState(model, nextState, options);
    });
  };
};
