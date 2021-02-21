import { Collection } from 'backbone';
import Page from './Page';

export default Collection.extend({
  model: Page,

  initialize(models, config = {}) {
    this.config = config;
  },

  add(m, o = {}) {
    const { config } = this;
    return Collection.prototype.add.call(this, m, { ...o, config });
  }
});
