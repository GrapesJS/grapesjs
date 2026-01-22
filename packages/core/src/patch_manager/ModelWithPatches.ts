import { enablePatches, produceWithPatches } from 'immer';
import EditorModel from '../editor/model/Editor';
import { Model, ObjectHash, SetOptions } from '../common';
import { createId, serialize } from '../utils/mixins';
import PatchManager, { PatchChangeProps, PatchPath } from './index';

enablePatches();

type SetArgs<T> = {
  attrs: Partial<T>;
  opts: SetOptions;
};

const normalizeSetArgs = <T>(args: any[]): SetArgs<T> => {
  const [first, second, third] = args;

  if (typeof first === 'string') {
    return {
      attrs: { [first]: second } as any,
      opts: (third || {}) as SetOptions,
    };
  }

  return {
    attrs: (first || {}) as Partial<T>,
    opts: (second || {}) as SetOptions,
  };
};

const normalizePatchPaths = (patches: PatchChangeProps[], prefix: PatchPath): PatchChangeProps[] =>
  patches.map((patch) => ({
    ...patch,
    path: [...prefix, ...patch.path],
    ...(patch.from ? { from: [...prefix, ...patch.from] } : {}),
  }));

const syncDraftToState = (draft: any, target: any) => {
  const isObject = (value: any): value is Record<string, any> =>
    value != null && typeof value === 'object' && !Array.isArray(value);

  if (Array.isArray(draft) && Array.isArray(target)) {
    if (draft.length > target.length) {
      draft.splice(target.length, draft.length - target.length);
    }

    for (let i = 0; i < target.length; i++) {
      const draftValue = draft[i];
      const targetValue = target[i];

      if (Array.isArray(draftValue) && Array.isArray(targetValue)) {
        syncDraftToState(draftValue, targetValue);
      } else if (isObject(draftValue) && isObject(targetValue)) {
        syncDraftToState(draftValue, targetValue);
      } else if (draftValue !== targetValue) {
        draft[i] = targetValue;
      }
    }

    // Add new entries (after syncing shared indexes).
    for (let i = draft.length; i < target.length; i++) {
      draft.push(target[i]);
    }

    return;
  }

  if (!isObject(draft) || !isObject(target)) {
    return;
  }

  Object.keys(draft).forEach((key) => {
    if (!(key in target)) {
      delete draft[key];
    }
  });

  Object.keys(target).forEach((key) => {
    const draftValue = draft[key];
    const targetValue = target[key];

    if (Array.isArray(draftValue) && Array.isArray(targetValue)) {
      syncDraftToState(draftValue, targetValue);
    } else if (isObject(draftValue) && isObject(targetValue)) {
      syncDraftToState(draftValue, targetValue);
    } else if (draftValue !== targetValue) {
      draft[key] = targetValue;
    }
  });
};

const isValidPatchUid = (uid: any): uid is string | number => {
  if (typeof uid === 'string') return uid !== '';
  return typeof uid === 'number';
};

const createStableUid = () => {
  const randomUUID = typeof crypto !== 'undefined' && (crypto as any).randomUUID;
  return typeof randomUUID === 'function' ? randomUUID.call(crypto) : createId();
};

const stripUid = <T extends ObjectHash>(attrs: Partial<T>): Partial<T> => {
  const attrsAny = attrs as any;
  if (attrsAny && typeof attrsAny === 'object' && 'uid' in attrsAny) {
    const { uid: _uid, ...rest } = attrsAny;
    return rest as Partial<T>;
  }

  return attrs;
};

const isPatchPathExcluded = (path: PatchPath, exclusions: PatchPath[]) =>
  exclusions.some((excludedPath) =>
    excludedPath.every((excludedSeg, index) => path[index] === excludedSeg),
  );

const filterExcludedPatches = (patches: PatchChangeProps[], exclusions: PatchPath[]) => {
  if (!exclusions.length || !patches.length) return patches;
  return patches.filter((patch) => {
    const { path, from } = patch;
    if (isPatchPathExcluded(path, exclusions)) return false;
    if (from && isPatchPathExcluded(from, exclusions)) return false;
    return true;
  });
};

export default class ModelWithPatches<T extends ObjectHash = any, S = SetOptions, E = any> extends Model<T, S, E> {
  em?: EditorModel;
  patchObjectType?: string;

  protected getPatchExcludedPaths(): PatchPath[] {
    return [];
  }

  protected get patchManager(): PatchManager | undefined {
    const pm = (this.em as any)?.Patches as PatchManager | undefined;
    return pm?.isEnabled && this.patchObjectType ? pm : undefined;
  }

  protected getPatchObjectId(): string | number | undefined {
    return this.get('uid' as any);
  }

  clone(): this {
    const attrs = serialize(this.attributes || {}) as any;
    attrs.uid = createStableUid();
    return new (this.constructor as any)(attrs);
  }

  set(...args: any[]): this {
    const { attrs: rawAttrs, opts } = normalizeSetArgs<T>(args);

    const existingUid = this.get('uid' as any) as string | number | undefined;
    const hasExistingUid = isValidPatchUid(existingUid);

    // UID is immutable: ignore any attempt to change/unset it via public `set`
    const immutableAttrs = hasExistingUid ? stripUid(rawAttrs) : rawAttrs;

    const pm = this.patchManager;

    if (!pm) {
      return super.set(immutableAttrs as any, opts as any);
    }

    // Never accept UID mutations via public `set` while tracking patches
    const attrsNoUid = stripUid(immutableAttrs);

    const beforeState = serialize(this.attributes || {}) as any;
    const stateUid = beforeState.uid;
    const uid = isValidPatchUid(stateUid) ? stateUid : hasExistingUid ? existingUid : pm.createId();
    beforeState.uid = uid;

    // Ensure UID exists before applying changes, but do not record it in patches
    if (!hasExistingUid && isValidPatchUid(uid)) {
      super.set({ uid } as any, { silent: true } as any);
    }

    if (!isValidPatchUid(uid)) {
      return super.set(attrsNoUid as any, opts as any);
    }

    const result = super.set(attrsNoUid as any, opts as any);
    const afterState = serialize(this.attributes || {});
    (afterState as any).uid = uid;
    const [, patches, inversePatches] = produceWithPatches<any>(beforeState, (draft: any) => {
      syncDraftToState(draft, afterState);
    });

    const excludedPaths = this.getPatchExcludedPaths();
    const nextPatches = filterExcludedPatches(patches, excludedPaths);
    const nextInversePatches = filterExcludedPatches(inversePatches, excludedPaths);

    if (nextPatches.length || nextInversePatches.length) {
      const prefix: PatchPath = [this.patchObjectType as string, uid, 'attributes'];
      const activePatch = pm.createOrGetCurrentPatch();
      activePatch.changes.push(...normalizePatchPaths(nextPatches, prefix));
      // Reverse changes should be applied in reverse order.
      activePatch.reverseChanges.unshift(...normalizePatchPaths(nextInversePatches, prefix));
    }

    return result;
  }
}
