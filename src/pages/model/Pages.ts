import { Collection } from '../../common';
import Page from './Page';

export default class Pages extends Collection<Page> {
  constructor(models: any) {
    super(models);
    this.on('reset', this.onReset);
    this.on('remove', this.onRemove);
  }

  onReset(m: Page, opts?: { previousModels?: Pages }) {
    opts?.previousModels?.map((p) => this.onRemove(p));
  }

  onRemove(removed?: Page) {
    removed?.onRemove();
  }
}
