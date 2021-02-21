import { bindAll } from 'underscore';
import { Collection } from 'backbone';
import model from './Frame';

export default Collection.extend({
  model,

  initialize(models, config = {}) {
    bindAll(this, 'itemLoaded');
    this.config = config;
  },

  itemLoaded() {
    this.loadedItems++;

    if (this.loadedItems >= this.itemsToLoad) {
      this.trigger('loaded:all');
      this.listenToLoadItems(0);
    }
  },

  listenToLoad() {
    this.loadedItems = 0;
    this.itemsToLoad = this.length;
    this.listenToLoadItems(1);
  },

  listenToLoadItems(on) {
    this.forEach(item => item[on ? 'on' : 'off']('loaded', this.itemLoaded));
  },

  add(m, o = {}) {
    const { config } = this;
    return Collection.prototype.add.call(this, m, { ...o, config });
  }
});
