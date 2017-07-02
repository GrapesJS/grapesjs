var Backbone = require('backbone');
var Layer = require('./Layer');

module.exports = Backbone.Collection.extend({

  model: Layer,

  initialize() {
    this.idx = 1;
    this.on('add', this.onAdd);
    this.on('reset', this.onReset);
  },

  onAdd(model, c, opts) {
    if(!opts.noIncrement)
      model.set('index', this.idx++);
  },

  onReset() {
    this.idx = 1;
  }

});
