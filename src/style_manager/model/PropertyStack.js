import Property from './PropertyComposite';
import Layers from './Layers';

export default Property.extend({
  defaults: {
    ...Property.prototype.defaults,
    // Array of layers (which contain properties)
    layers: [],

    // The separator used to join layer values
    layerSeparator: ', ',

    // Layer preview
    preview: 0
  },

  initialize(props = {}, opts = {}) {
    Property.callParentInit(Property, this, props, opts);
    const layers = this.get('layers');
    const layersColl = new Layers(layers);
    layersColl.property = this;
    layersColl.properties = this.get('properties');
    this.set('layers', layersColl);
    Property.callInit(this, props, opts);
  },

  getLayers() {
    return this.get('layers');
  },

  getCurrentLayer() {
    return this.getLayers().filter(layer => layer.get('active'))[0];
  },

  getFullValue() {
    return this.get('detached') ? '' : this.get('layers').getFullValue();
  },

  getValueFromStyle(styles = {}) {
    const layers = this.getLayers().getLayersFromStyle(styles);
    return new Layers(layers).getFullValue();
  },

  clearValue() {
    this.getLayers().reset();
    return Property.prototype.clearValue.apply(this, arguments);
  },

  /**
   * This method allows to customize layers returned from the target
   * @param  {Object} target
   * @return {Array} Should return an array of layers
   * @example
   * // return example
   * [
   *  {
   *    properties: [
   *      { property: 'width', ... }
   *      { property: 'height', ... }
   *    ]
   *  }
   * ]
   */
  getLayersFromTarget(target) {
    return;
  }
});
