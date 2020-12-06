import Backbone from 'backbone';
import Sector from './Sector';

export default Backbone.Collection.extend({
  model: Sector,

  initialize() {
    this.listenTo(this, 'reset', this.onReset);
  },

  onReset(models, opts = {}) {
    const prev = opts.previousModels || [];
    prev.forEach(sect => sect.get('properties').reset());
  }
});
