import { Collection, RemoveOptions } from '../../common';
import EditorModel from '../../editor/model/Editor';
import Page from './Page';

export default class Pages extends Collection<Page> {
  constructor(models: any, em: EditorModel) {
    super(models);
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
    if (opts.fromUndo) return;
    removed?.onRemove();
  }
}
