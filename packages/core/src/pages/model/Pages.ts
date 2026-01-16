import { RemoveOptions } from '../../common';
import EditorModel from '../../editor/model/Editor';
import Page from './Page';
import CollectionWithPatches from '../../patch_manager/CollectionWithPatches';

export default class Pages extends CollectionWithPatches<Page> {
  patchObjectType = 'pages';

  constructor(models: any, opts: { em: EditorModel; collectionId?: string }) {
    const { em } = opts;
    super(models, { ...opts, patchObjectType: 'pages', collectionId: opts.collectionId || 'global' } as any);
    this.on('reset', this.onReset);
    this.on('remove', this.onRemove);

    // @ts-ignore We need to inject `em` for pages created on reset from the Storage load
    this.model = (props: {}, opts = {}) => {
      return new Page(props, { ...opts, em });
    };
  }

  onReset(m: Page, opts?: RemoveOptions & { previousModels?: Pages }) {
    opts?.previousModels?.map((p) => this.onRemove(p, this, opts));
  }

  onRemove(removed?: Page, _p?: this, opts: RemoveOptions = {}) {
    // Avoid removing frames if triggered from undo #6142
    if (opts.fromUndo || opts.temporary) return;
    removed?.onRemove();
  }
}
