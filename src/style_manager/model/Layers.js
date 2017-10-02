const Layer = require('./Layer');

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
  },

  active(index) {
    this.each(layer => layer.set('active', 0));
    const layer = this.at(index);
    layer && layer.set('active', 1);
  },

  getFullValue() {
    let result = [];
    this.each(layer => result.push(layer.getFullValue()));
    return result.join(', ');
  },

  getPropertyValues(property) {
    const result = [];
    this.each(layer => {
      const value = layer.getPropertyValue(property);
      value && result.push(value);
    });
    return result.join(',');
  }

});
