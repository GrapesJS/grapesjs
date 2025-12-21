import { enablePatches, produceWithPatches } from 'immer';
import EditorModel from '../editor/model/Editor';
import { Model, ObjectHash, SetOptions } from '../common';
import { serialize } from '../utils/mixins';
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

export default class ModelWithPatches<T extends ObjectHash = any, S = SetOptions, E = any> extends Model<T, S, E> {
  em?: EditorModel;
  patchObjectType?: string;

  protected get patchManager(): PatchManager | undefined {
    const pm = (this.em as any)?.Patches as PatchManager | undefined;
    return pm?.isEnabled && this.patchObjectType ? pm : undefined;
  }

  protected getPatchObjectId(): string | number | undefined {
    const id = (this as any).id ?? (this as any).get?.('id');
    return id ?? (this as any).cid;
  }

  set(...args: any[]): this {
    const pm = this.patchManager;
    const objectId = this.getPatchObjectId();

    if (!pm || !objectId) {
      return (super.set as any).apply(this, args);
    }

    const { attrs, opts } = normalizeSetArgs<T>(args);
    const beforeState = serialize(this.attributes || {});
    const result = super.set(attrs as any, opts as any);
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
