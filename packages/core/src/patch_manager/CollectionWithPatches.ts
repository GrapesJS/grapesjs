import EditorModel from '../editor/model/Editor';
import { AddOptions, Collection, Model, RemoveOptions } from '../common';
import PatchManager from './index';

export interface CollectionWithPatchesOptions extends AddOptions {
  em?: EditorModel;
  patchObjectType?: string;
}

const isValidPatchUid = (uid: any): uid is string | number => {
  if (typeof uid === 'string') return uid !== '';
  return typeof uid === 'number';
};

export default class CollectionWithPatches<T extends Model = Model> extends Collection<T> {
  em?: EditorModel;
  patchObjectType?: string;

  constructor(models?: any, options: CollectionWithPatchesOptions = {}) {
    super(models, options);
    this.em = options.em;
    this.patchObjectType = options.patchObjectType;
  }

  protected get patchManager(): PatchManager | undefined {
    const pm = (this.em as any)?.Patches as PatchManager | undefined;
    return pm?.isEnabled && this.patchObjectType ? pm : undefined;
  }

  protected getModelUid(model: T): string | number | undefined {
    const uid = (model as any)?.get?.('uid');
    return isValidPatchUid(uid) ? uid : undefined;
  }

  protected shouldHandleRemoval(_model: T, opts?: RemoveOptions): boolean {
    return !(opts as any)?.temporary;
  }
}
