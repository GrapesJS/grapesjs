const Property = require('./PropertyComposite');
const Layers = require('./Layers');

module.exports = Property.extend({

  defaults: Object.assign({}, Property.prototype.defaults, {
    // Array of layers (which contain properties)
    layers: [],

    // Layer preview
    preview: 0,
  }),

  init() {
    Property.prototype.init.apply(this, arguments);
    const layers = this.get('layers');
    this.set('layers', new Layers(layers));
  },

  getFullValue() {
    return this.get('detached') ? '' : this.get('layers').getFullValue();
  },

});
