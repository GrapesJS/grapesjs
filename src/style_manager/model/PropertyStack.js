const Property = require('./PropertyComposite');
const Layers = require('./Layers');

module.exports = Property.extend({
  defaults: {
    ...Property.prototype.defaults,
    // Array of layers (which contain properties)
    layers: [],

    // Layer preview
    preview: 0
  },

  initialize(props = {}, opts = {}) {
    Property.callParentInit(Property, this, props, opts);
    const layers = this.get('layers');
    const layersColl = new Layers(layers);
    layersColl.properties = this.get('properties');
    this.set('layers', layersColl);
    Property.callInit(this, props, opts);
  },

  getFullValue() {
    return this.get('detached') ? '' : this.get('layers').getFullValue();
  }
});
