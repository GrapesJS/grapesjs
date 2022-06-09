import { Collection } from '../../common';
import EditorModel from '../../editor/model/Editor';
import Page from './Page';

export default class Pages extends Collection<Page> {
  constructor(models: any, em: EditorModel) {
    super(models);
    this.on('reset', this.onReset);
    this.on('remove', this.onRemove);

    // @ts-ignore We need to inject `em` for pages created on reset from the Storage load
    this.model = (props: {}, opts = {}) => {
      return new Page(props, {...opts, em });
    }
  }

  onReset(m: Page, opts?: { previousModels?: Pages }) {
    opts?.previousModels?.map((p) => this.onRemove(p));
  }

  onRemove(removed?: Page) {
    removed?.onRemove();
  }
}
