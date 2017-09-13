const Property = require('./PropertyComposite');

module.exports = Property.extend({

  defaults: Object.assign({}, Property.prototype.defaults, {
    // Array of layers (which contain properties)
    layers: [],
    // Layer preview
    preview: 0,
  }),

  getFullValue() {
    if (this.get('detached')) {
      return '';
    }

    const layers = this.get('layers');
    let val = layers.length ? layers.pluck('value').join(', ') : '';
    return val;
  },

});
