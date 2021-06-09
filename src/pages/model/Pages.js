import { Collection } from 'backbone';
import Page from './Page';

export default class Pages extends Collection {
  initialize(models, config = {}) {
    this.config = config;
    this.on('reset', this.onReset);
    this.on('remove', this.onRemove);
  }

  onReset(m, opts = {}) {
    const prev = opts.previousModels || [];
    prev.map(p => this.onRemove(p));
  }

  onRemove(removed) {
    removed && removed.onRemove();
  }

  add(m, o = {}) {
    const { config } = this;
    return Collection.prototype.add.call(this, m, { ...o, config });
  }
}

Pages.prototype.model = Page;
