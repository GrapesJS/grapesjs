import { bindAll } from 'underscore';
import { Collection } from 'backbone';
import model from './Frame';

export default class Frames extends Collection {
  initialize(models, config = {}) {
    bindAll(this, 'itemLoaded');
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

  itemLoaded() {
    this.loadedItems++;

    if (this.loadedItems >= this.itemsToLoad) {
      this.trigger('loaded:all');
      this.listenToLoadItems(0);
    }
  }

  listenToLoad() {
    this.loadedItems = 0;
    this.itemsToLoad = this.length;
    this.listenToLoadItems(1);
  }

  listenToLoadItems(on) {
    this.forEach(item => item[on ? 'on' : 'off']('loaded', this.itemLoaded));
  }

  add(m, o = {}) {
    const { config } = this;
    return Collection.prototype.add.call(this, m, { ...o, config });
  }
}

Frames.prototype.model = model;
