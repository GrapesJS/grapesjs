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
  Object.keys(draft).forEach((key) => {
    if (!(key in target)) {
      delete draft[key];
    }
  });

  Object.keys(target).forEach((key) => {
    draft[key] = target[key];
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

export default class ModelWithPatches<T extends ObjectHash = any, S = SetOptions, E = any> extends Model<T, S, E> {
  em?: EditorModel;
  patchObjectType?: string;

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
    const incomingUid = (rawAttrs as any).uid;

    // UID is immutable: ignore any attempt to change/unset it via public `set`
    const attrs = hasExistingUid && 'uid' in (rawAttrs as any) ? (({ uid: _uid, ...rest }) => rest)(rawAttrs as any) : rawAttrs;

    const pm = this.patchManager;

    if (!pm) {
      return super.set(attrs as any, opts as any);
    }

    const uid = hasExistingUid ? existingUid : isValidPatchUid(incomingUid) ? incomingUid : pm.createId();

    // Ensure UID exists before taking snapshots to avoid recording it inside patches
    if (!hasExistingUid && isValidPatchUid(uid)) {
      super.set({ uid } as any, { silent: true });
    }

    // Never track UID mutations via patches
    const attrsNoUid = 'uid' in (attrs as any) ? (({ uid: _uid, ...rest }) => rest)(attrs as any) : attrs;

    const objectId = this.getPatchObjectId();

    if (!isValidPatchUid(objectId)) {
      return super.set(attrsNoUid as any, opts as any);
    }
    const beforeState = serialize(this.attributes || {});
    const result = super.set(attrsNoUid as any, opts as any);
    const afterState = serialize(this.attributes || {});
    const [, patches, inversePatches] = produceWithPatches<any>(beforeState, (draft: any) => {
      syncDraftToState(draft, afterState);
    });

    if (patches.length || inversePatches.length) {
      const prefix: PatchPath = [this.patchObjectType as string, objectId, 'attributes'];
      const activePatch = pm.createOrGetCurrentPatch();
      activePatch.changes.push(...normalizePatchPaths(patches, prefix));
      activePatch.reverseChanges.push(...normalizePatchPaths(inversePatches, prefix));
    }

    return result;
  }
}
