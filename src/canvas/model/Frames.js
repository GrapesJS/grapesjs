import { bindAll } from 'underscore';
import Backbone from 'backbone';
import model from './Frame';

export default class Frames extends Backbone.Collection {
    initialize() {
        bindAll(this, 'itemLoaded');
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
}
Frames.prototype.model = model;
