import Backbone from 'backbone';
import Sector from './Sector';

export default class Sectors extends Backbone.Collection {
    initialize() {
        this.listenTo(this, 'reset', this.onReset);
    }

    onReset(models, opts = {}) {
        const prev = opts.previousModels || [];
        prev.forEach(sect => sect.get('properties').reset());
    }
}
Sectors.prototype.model = Sector;
