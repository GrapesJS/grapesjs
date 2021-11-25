import { keys, isUndefined } from 'underscore';
import Property from './PropertyComposite';
import Layers from './Layers';

const VALUES_REG = /,(?![^\(]*\))/;
const PARTS_REG = /\s(?![^(]*\))/;

export default Property.extend({
  defaults: {
    ...Property.prototype.defaults,
    // Array of layers (which contain properties)
    layers: [],

    // The separator used to join layer values
    layerSeparator: ', ',

    // Prepend new layers in the list
    prepend: 0,

    // Layer preview
    preview: 0,

    // Parse single layer value string
    parseLayer: null,
  },

  initialize(props = {}, opts = {}) {
    Property.callParentInit(Property, this, props, opts);
    const layers = this.get('layers');
    const layersColl = new Layers(layers);
    layersColl.property = this;
    layersColl.properties = this.get('properties');
    this.set('layers', layersColl, { silent: true });
    Property.callInit(this, props, opts);
  },

  _up(props, opts = {}) {
    const { __layers = [], ...rest } = props;
    const layers = __layers.map(values => ({ values }));
    this.getLayers().reset(layers);
    console.log('_up from stack', this.get('property'), { layers, rest, opts });
    return Property.prototype._up.call(this, rest, opts);
  },

  __parseValue(value) {
    const result = this.parseValue(value);
    result.__layers = value
      .split(VALUES_REG)
      .map(v => v.trim())
      .map(v => this.__parseLayer(v))
      .filter(Boolean);

    return result;
  },

  __parseLayer(value) {
    const parseFn = this.get('parseLayer');
    const values = value.split(PARTS_REG);
    return parseFn ? parseFn({ value, values }) : values;
  },

  addLayer(props = {}) {
    return this.get('layers').push({ properties: [] });
  },

  /**
   * Get style object from layer values
   * @param {[Layer]} layer
   */
  getStyleFromLayer(layer) {
    const sep = this.get('separator');
    const values = layer.getValues();
    const result = this.getProperties().map(prop => {
      const name = prop.getName();
      const val = values[name];
      const value = isUndefined(val) ? prop.getDefaultValue() : val;
      return { name, value };
    });

    return this.get('detached')
      ? result.reduce((acc, item) => {
          acc[item.name] = item.value;
          return acc;
        }, {})
      : {
          [this.getName()]: result.map(r => r.value).join(sep),
        };
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

  getValueFromTarget(target) {
    const { detached, property, properties } = this.attributes;
    const style = target.getStyle();
    const validStyles = {};

    properties.forEach(prop => {
      const name = prop.get('property');
      const value = style[name];
      if (value) validStyles[name] = value;
    });

    return !detached ? style[property] : keys(validStyles).length ? validStyles : '';
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
  },
});
