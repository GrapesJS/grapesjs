import { keys, isUndefined, isArray, isString } from 'underscore';
import Property from './PropertyComposite';
import PropertyBase from './Property';
import Layers from './Layers';
import { camelCase } from 'utils/mixins';

const VALUES_REG = /,(?![^\(]*\))/;
const PARTS_REG = /\s(?![^(]*\))/;

export default Property.extend({
  defaults: {
    ...Property.prototype.defaults,
    // Array of layers (which contain properties)
    layers: [],

    // The separator used to split layer values
    layerSeparator: ', ',

    // The separator used to join layer values
    layerJoin: '',

    // Prepend new layers in the list
    prepend: 0,

    // Layer preview
    preview: 0,

    // Custom layer label function
    layerLabel: null,

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
    this.__upTargetsStyleProps(opts);
  },

  __upLayers(m, c, o) {
    this.__upTargetsStyleProps(o || c);
  },

  __upTargets(p, opts = {}) {
    if (opts.__select) return;
    return PropertyBase.prototype.__upTargets.call(this, p, opts);
  },

  __upTargetsStyleProps(opts = {}) {
    this.__upTargetsStyle(this.getStyleFromLayers(), opts);
  },

  __upTargetsStyle(style, opts) {
    return PropertyBase.prototype.__upTargetsStyle.call(this, style, opts);
  },

  __upSelected({ noEvent } = {}, opts = {}) {
    if (!this.__hasCustom()) return;
    const sm = this.em.get('StyleManager');
    const selected = this.getSelectedLayer();
    const values = selected?.getValues();

    // Update properties by layer value
    values &&
      this.getProperties().forEach(prop => {
        const value = values[prop.getId()];
        !isUndefined(value) && prop.upValue(value, { ...opts, __up: true });
      });

    !noEvent && sm.__trgEv(sm.events.layerSelect, { property: this });
  },

  _up(props, opts = {}) {
    const { __layers = [], ...rest } = props;
    this.__setLayers(__layers);
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

  __getLayersFromStyle(style = {}) {
    if (!this.__styleHasProps(style)) return null;

    const name = this.getName();
    const props = this.getProperties();
    const sep = this.getLayerSeparator();
    const fromStyle = this.get('fromStyle');
    let result = fromStyle ? fromStyle(style, { property: this, separatorLayers: sep }) : [];

    if (!fromStyle) {
      // Get layers from the main property
      const layers = this.__splitStyleName(style, name, sep)
        .map(value => value.split(this.getSplitSeparator()))
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
        this.__splitStyleName(style, prop.getName(), sep)
          .map(value => ({ [id]: value || prop.getDefaultValue() }))
          .forEach((inLayer, i) => {
            layers[i] = layers[i] ? { ...layers[i], ...inLayer } : inLayer;
          });
      });
      result = layers;
    }

    return isArray(result) ? result : [result];
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
   * Get layer label
   * @param {[Layer]} layer
   * @returns {String}
   */
  getLayerLabel(layer) {
    let result = '';

    if (layer) {
      const layerLabel = this.get('layerLabel');
      const values = layer.getValues();
      const index = layer.getIndex();

      if (layerLabel) {
        result = layerLabel(layer, { index, values, property: this });
      } else {
        const parts = [];
        this.getProperties().map(prop => {
          parts.push(values[prop.getId()]);
        });
        result = parts.filter(Boolean).join(' ');
      }
    }

    return result;
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
   * Get style object from layer
   * @param {[Layer]} layer
   * @returns {Object} Style object
   */
  getStyleFromLayer(layer, opts = {}) {
    const join = this.__getJoin();
    const joinLayers = this.__getJoinLayers();
    const toStyle = this.get('toStyle');
    const name = this.getName();
    const values = layer.getValues();
    let style;

    if (toStyle) {
      style = toStyle(values, { join, joinLayers, name, property: this });
    } else {
      const result = this.getProperties().map(prop => {
        const name = prop.getName();
        const val = values[name];
        const value = isUndefined(val) ? prop.getDefaultValue() : val;
        return { name, value };
      });
      style = this.get('detached')
        ? result.reduce((acc, item) => {
            acc[item.name] = item.value;
            return acc;
          }, {})
        : {
            [this.getName()]: result.map(r => r.value).join(join),
          };
    }

    return opts.camelCase
      ? Object.keys(style).reduce((res, key) => {
          res[camelCase(key)] = style[key];
          return res;
        }, {})
      : style;
  },

  /**
   * Get style object from current layers
   * @returns {Object} Style object
   */
  getStyleFromLayers() {
    let result = {};
    const name = this.getName();
    const layers = this.getLayers();
    const styles = layers.map(l => this.getStyleFromLayer(l));
    styles.forEach(style => {
      keys(style).map(key => {
        if (!result[key]) result[key] = [];
        result[key].push(style[key]);
      });
    });
    keys(result).map(key => {
      result[key] = result[key].join(this.__getJoinLayers());
    });

    if (this.isDetached()) {
      result[name] = '';
    } else {
      const style = this.getProperties().reduce((acc, prop) => {
        acc[prop.getName()] = '';
        return acc;
      }, {});
      result[name] = result[name] || '';
      result = { ...result, ...style };
    }

    return result;
  },

  __getJoinLayers() {
    const join = this.get('layerJoin');
    const sep = this.get('layerSeparator');

    return join || (isString(sep) ? sep : join);
  },

  __getFullValue() {
    if (this.get('detached')) return '';
    const style = this.getStyleFromLayers();

    return style[this.getName()];
  },

  /**
   * Get layer sperator
   * @return {RegExp}
   */
  getLayerSeparator() {
    const sep = this.get('layerSeparator');
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
   * Extended
   * @private
   */
  hasValue(opts = {}) {
    const { noParent } = opts;
    const parentValue = noParent && this.getParentTarget();
    return this.getLayers().length > 0 && !parentValue;
  },

  /**
   * Extended
   * @private
   */
  clear(opts = {}) {
    this.getLayers().reset();
    this.__upTargetsStyleProps(opts);
    return PropertyBase.prototype.clear.call(this);
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
