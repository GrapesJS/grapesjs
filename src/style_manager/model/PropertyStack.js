import { keys, isUndefined, isArray, isString } from 'underscore';
import Property from './PropertyComposite';
import PropertyBase from './Property';
import Layers from './Layers';
import { camelCase } from 'utils/mixins';

const VALUES_REG = /,(?![^\(]*\))/;
const PARTS_REG = /\s(?![^(]*\))/;

const splitStyleName = (style, name, sep) => {
  return (style[name] || '')
    .split(sep)
    .map(value => value.trim())
    .filter(Boolean);
};

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

    // Current selected layer
    selectedLayer: null,
  },

  initialize(props = {}, opts = {}) {
    Property.callParentInit(Property, this, props, opts);
    const layers = this.get('layers');
    const layersColl = new Layers(layers);
    layersColl.property = this;
    layersColl.properties = this.get('properties');
    this.set('layers', layersColl, { silent: true });
    this.on('change:selectedLayer', this.__upSelected);
    this.listenTo(layersColl, 'add remove', this.__upLayers);
    Property.callInit(this, props, opts);
  },

  __upProperties(prop, opts = {}) {
    const layer = this.getSelectedLayer();
    if (opts.__up || !layer) return;
    const name = prop.getName();
    layer.upValues({ [name]: prop.__getFullValue() });
    const value = this.__getFullValue();
    this.upValue(value, opts);
    this.__upTargetsStyleProps(opts);
  },

  __upLayers(m, c, o) {
    const value = this.__getFullValue();
    this.upValue(value);
    this.__upTargetsStyleProps(o || c);
  },

  __upTargets(p, opts = {}) {
    if (opts.__select) return;
    return PropertyBase.prototype.__upTargets.call(this, p, opts);
  },

  __upTargetsStyle(style, opts) {
    return PropertyBase.prototype.__upTargetsStyle.call(this, style, opts);
  },

  __upTargetsStyleProps(opts = {}) {
    if (!this.isDetached()) {
      const style = this.getProperties().reduce((acc, prop) => {
        acc[prop.getName()] = '';
        return acc;
      }, {});
      this.__upTargetsStyle(style, opts);
    }
  },

  __upSelected({ noEvent } = {}, opts = {}) {
    if (!this.__hasCustom()) return;
    const sm = this.em.get('StyleManager');
    const selected = this.getSelectedLayer();
    const values = selected?.getValues();

    // Update properties by layer value
    values &&
      this.getProperties().forEach(prop => {
        const name = prop.getName();
        const value = values[name];
        !isUndefined(value) && prop.upValue(value, { ...opts, __up: true });
      });

    !noEvent && sm.__trgEv(sm.events.layerSelect, { property: this });
  },

  _up(props, opts = {}) {
    const { __layers = [], ...rest } = props;
    const layers = this.getLayers();
    const layersNew = __layers.map(values => ({ values }));

    if (layers.length === layersNew.length) {
      layersNew.map((layer, n) => {
        layers.at(n)?.upValues(layer.values);
      });
    } else {
      this.getLayers().reset(layersNew);
    }

    this.__upSelected({ noEvent: true }, opts);
    return Property.prototype._up.call(this, rest, opts);
  },

  __setLayers(newLayers = []) {
    const layers = this.getLayers();
    const layersNew = newLayers.map(values => ({ values }));

    if (layers.length === layersNew.length) {
      layersNew.map((layer, n) => layers.at(n)?.upValues(layer.values));
    } else {
      this.getLayers().reset(layersNew);
    }
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
    const properties = this.getProperties();
    return parseFn
      ? parseFn({ value, values })
      : properties.reduce((acc, prop, i) => {
          const value = values[i];
          acc[prop.getId()] = !isUndefined(value) ? value : prop.getDefaultValue();
          return acc;
        }, {});
  },

  __getFromStyle(style = {}) {
    const fromStyle = this.get('fromStyle');

    return fromStyle ? fromStyle(style) : style;
  },

  __getLayersFromStyle(style = {}) {
    const name = this.getName();
    const props = this.getProperties();
    const nameProps = props.map(prop => prop.getName());
    const allNameProps = [name, ...nameProps];
    const hasProps = allNameProps.some(prop => !isUndefined(style[prop]));

    if (!hasProps) {
      return [];
    } else {
      const sep = this.getLayerSeparator();
      const sepParts = this.getPartsSeparator();
      const fromStyle = this.get('fromStyle');
      let result = fromStyle ? fromStyle(style, { property: this, separatorLayers: sep }) : [];

      if (!fromStyle) {
        // Get layers from the main property
        const layers = splitStyleName(style, name, sep)
          .map(value => value.split(sepParts))
          .map(parts => {
            const result = {};
            props.forEach((prop, i) => {
              const value = parts[i];
              result[prop.getId()] = !isUndefined(value) ? value : prop.getDefaultValue();
            });
            return result;
          });
        // Get layers from the inner properties
        props.forEach(prop => {
          const id = prop.getId();
          splitStyleName(style, prop.getName(), sep)
            .map(value => ({ [id]: value || prop.getDefaultValue() }))
            .forEach((inLayer, i) => {
              layers[i] = layers[i] ? { ...layers[i], ...inLayer } : inLayer;
            });
        });
        result = layers;
      }

      return isArray(result) ? result : [result];
    }
  },

  hasValue(opts) {
    return PropertyBase.prototype.hasValue.call(this, opts);
  },

  /**
   * Add new layer to the stack
   * @param {Object} [props={}] Layer props
   * @param {Object} [opts={}] Options
   * @returns {[Layer]}
   */
  addLayer(props = {}, opts = {}) {
    const values = {};
    this.getProperties().forEach(prop => {
      const name = prop.getName();
      const value = props[name];
      values[name] = isUndefined(value) ? prop.getDefaultValue() : value;
    });
    const layer = this.get('layers').push({ values }, opts);

    return layer;
  },

  /**
   * Remove layer
   * @param {[Layer]} layer
   * @returns {[Layer]} Removed layer
   */
  removeLayer(layer) {
    return this.get('layers').remove(layer);
  },

  /**
   * Remove layer at index
   * @param {Number} index Index of the layer to remove
   * @returns {[Layer] | null} Removed layer
   */
  removeLayerAt(index = 0) {
    const layer = this.getLayer(index);
    return layer ? this.removeLayer(layer) : null;
  },

  /**
   * Select layer
   * @param {[Layer]} layer
   */
  selectLayer(layer) {
    return this.set('selectedLayer', layer, { __select: true });
  },

  /**
   * Select layer at index
   * @param {Number} index Index of the layer to select
   */
  selectLayerAt(index = 0) {
    const layer = this.getLayer(index);
    return layer && this.selectLayer(layer);
  },

  /**
   * Get selected layer
   * @returns {[Layer] | null}
   */
  getSelectedLayer() {
    const layer = this.get('selectedLayer');
    return layer && layer.getIndex() >= 0 ? layer : null;
  },

  /**
   * Get style object from layer values
   * @param {[Layer]} layer
   */
  getStyleFromLayer(layer, opts = {}) {
    const sep = this.get('separator');
    const values = layer.getValues();
    const result = this.getProperties().map(prop => {
      const name = prop.getName();
      const val = values[name];
      const value = isUndefined(val) ? prop.getDefaultValue() : val;
      return { name, value };
    });
    const style = this.get('detached')
      ? result.reduce((acc, item) => {
          acc[item.name] = item.value;
          return acc;
        }, {})
      : {
          [this.getName()]: result.map(r => r.value).join(sep),
        };

    return opts.camelCase
      ? Object.keys(style).reduce((res, key) => {
          res[camelCase(key)] = style[key];
          return res;
        }, {})
      : style;
  },

  __getFullValue() {
    if (this.get('detached')) return '';
    const name = this.getName();

    return this.getLayers()
      .map(l => this.getStyleFromLayer(l))
      .map(s => s[name])
      .filter(Boolean)
      .map(v => v?.trim())
      .join(this.get('layerSeparator'));
  },

  /**
   * Get layer sperator
   * @return {RegExp}
   */
  getLayerSeparator() {
    const sep = this.get('layerSeparator');
    return isString(sep) ? new RegExp(`${sep}(?![^\\(]*\\))`) : sep;
  },

  /**
   * Get layer parts sperator
   * @return {RegExp}
   */
  getPartsSeparator() {
    const sep = this.get('partsSeparator') || ' ';
    return isString(sep) ? new RegExp(`${sep}(?![^\\(]*\\))`) : sep;
  },

  getLayers() {
    return this.get('layers');
  },

  getLayer(index = 0) {
    return this.getLayers().at(index) || null;
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
