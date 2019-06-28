import Backbone from 'backbone';
var Device = require('./Device');

export default Backbone.Collection.extend({
  model: Device,

  comparator: (left, right) => {
    const max = Number.MAX_VALUE;
    return (right.get('priority') || max) - (left.get('priority') || max);
  },

  getSorted() {
    return this.sort();
  }
});
