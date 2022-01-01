import { keys, isUndefined, isArray, isString } from 'underscore';
import PropertyComposite, { isNumberType } from './PropertyComposite';
import PropertyBase from './Property';
import Layers from './Layers';
import { camelCase } from 'utils/mixins';

const VALUES_REG = /,(?![^\(]*\))/;
const PARTS_REG = /\s(?![^(]*\))/;

/**
 *
 * [Layer]: layer.html
 *
 *
 * @typedef PropertyStack
 * @property {Boolean} [preview=false] Indicate if the layer should display a preview.
 * @property {String|RegExp} [layerSeparator=', '] The separator used to split layer values.
 * @property {String} [layerJoin=', '] Value used to join layer values.
 * @property {Function} [layerLabel] Custom logic for creating layer labels.
 * \n
 * ```js
 *  layerLabel: (layer) => {
 *    const values = layer.getValues();
 *    return `A: ${values['prop-a']} B: ${values['prop-b']}`;
 *  }
 *  ```
 *
 */
export default class PropertyStack extends PropertyComposite {
  defaults() {
    return {
      ...PropertyComposite.getDefaults(),
      layers: [],
      layerSeparator: ', ',
      layerJoin: '',
      prepend: 0,
      preview: false,
      layerLabel: null,
      selectedLayer: null,
    };
  }

  /**
   * Get all available layers.
   * @returns {Collection<[Layer]>}
   */
  getLayers() {
    return this.get('layers');
  }

  /**
   * Get layer by index.
   * @param {Number} [index=0] Layer index position.
   * @returns {[Layer]|null}
   * @example
   * // Get the first layer
   * const layerFirst = property.getLayer(0);
   * // Get the last layer
   * const layers = this.getLayers();
   * const layerLast = property.getLayer(layers.length - 1);
   */
  getLayer(index = 0) {
    return this.getLayers().at(index) || null;
  }

  /**
   * Get selected layer.
   * @returns {[Layer] | null}
   */
  getSelectedLayer() {
    const layer = this.get('selectedLayer');
    return layer && layer.getIndex() >= 0 ? layer : null;
  }

  /**
   * Select layer.
   * Without a selected layer any update made on inner properties has no effect.
   * @param {[Layer]} layer Layer to select
   * @example
   * const layer = property.getLayer(0);
   * property.selectLayer(layer);
   */
  selectLayer(layer) {
    return this.set('selectedLayer', layer, { __select: true });
  }

  /**
   * Select layer by index.
   * @param {Number} index Index of the layer to select.
   * @example
   * property.selectLayerAt(1);
   */
  selectLayerAt(index = 0) {
    const layer = this.getLayer(index);
    return layer && this.selectLayer(layer);
  }

  /**
   * Add new layer to the stack.
   * @param {Object} [props={}] Custom property values to use in a new layer.
   * @param {Object} [opts={}] Options
   * @param {Number} [opts.at] Position index (by default the layer will be appended at the end).
   * @returns {[Layer]} Added layer.
   * @example
   * // Add new layer at the beginning of the stack with custom values
   * property.addLayer({ 'sub-prop1': 'value1', 'sub-prop2': 'value2' }, { at: 0 });
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
  }

  /**
   * Remove layer.
   * @param {[Layer]} layer Layer to remove.
   * @returns {[Layer]} Removed layer
   * @example
   * const layer = property.getLayer(0);
   * property.removeLayer(layer);
   */
  removeLayer(layer) {
    return this.get('layers').remove(layer);
  }

  /**
   * Remove layer by index.
   * @param {Number} index Index of the layer to remove
   * @returns {[Layer]|null} Removed layer
   * @example
   * property.removeLayerAt(0);
   */
  removeLayerAt(index = 0) {
    const layer = this.getLayer(index);
    return layer ? this.removeLayer(layer) : null;
  }

  /**
   * Get the layer label. The label can be customized with the `layerLabel` property.
   * @param {[Layer]} layer
   * @returns {String}
   * @example
   * const layer = this.getLayer(1);
   * const label = this.getLayerLabel(layer);
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
  }

  /**
   * Get style object from the layer.
   * @param {[Layer]} layer
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.camelCase] Return property names in camelCase.
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
      style = toStyle(values, { join, joinLayers, name, layer, property: this });
    } else {
      const result = this.getProperties().map(prop => {
        const name = prop.getName();
        const val = values[name];
        let value = isUndefined(val) ? prop.getDefaultValue() : val;

        // Limit number values if necessary (useful for previews)
        if (opts.number && isNumberType(prop.getType())) {
          const newVal = prop.parseValue(val, opts.number);
          value = `${newVal.value}${newVal.unit}`;
        }

        return { name, value };
      });
      style = this.isDetached()
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
  }

  getStylePreview(layer, opts = {}) {
    let result = {};
    const preview = this.get('preview');

    if (preview) {
      result = this.getStyleFromLayer(layer, opts);
    }

    return result;
  }

  /**
   * Get layer separator.
   * @return {RegExp}
   */
  getLayerSeparator() {
    const sep = this.get('layerSeparator');
    return isString(sep) ? new RegExp(`${sep}(?![^\\(]*\\))`) : sep;
  }

  initialize(props = {}, opts = {}) {
    PropertyComposite.callParentInit(PropertyComposite, this, props, opts);
    const layers = this.get('layers');
    const layersColl = new Layers(layers);
    layersColl.property = this;
    layersColl.properties = this.get('properties');
    this.set('layers', layersColl, { silent: true });
    this.on('change:selectedLayer', this.__upSelected);
    this.listenTo(layersColl, 'add remove', this.__upLayers);
    PropertyComposite.callInit(this, props, opts);
  }

  __upProperties(prop, opts = {}) {
    const layer = this.getSelectedLayer();
    if (opts.__up || !layer) return;
    const name = prop.getName();
    layer.upValues({ [name]: prop.__getFullValue() });
    this.__upTargetsStyleProps(opts);
  }

  __upLayers(m, c, o) {
    this.__upTargetsStyleProps(o || c);
  }

  __upTargets(p, opts = {}) {
    if (opts.__select) return;
    return PropertyBase.prototype.__upTargets.call(this, p, opts);
  }

  __upTargetsStyleProps(opts = {}) {
    this.__upTargetsStyle(this.getStyleFromLayers(), opts);
  }

  __upTargetsStyle(style, opts) {
    return PropertyBase.prototype.__upTargetsStyle.call(this, style, opts);
  }

  __upSelected({ noEvent } = {}, opts = {}) {
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
  }

  _up(props, opts = {}) {
    const { __layers = [], ...rest } = props;
    // Detached props will update their layers later in sm.__upProp
    !this.isDetached() && this.__setLayers(__layers);
    this.__upSelected({ noEvent: true }, opts);
    return PropertyBase.prototype._up.call(this, rest, opts);
  }

  __setLayers(newLayers = []) {
    const layers = this.getLayers();
    const layersNew = newLayers.map(values => ({ values }));

    if (layers.length === layersNew.length) {
      layersNew.map((layer, n) => layers.at(n)?.upValues(layer.values));
    } else {
      this.getLayers().reset(layersNew);
    }
  }

  __parseValue(value) {
    const result = this.parseValue(value);
    result.__layers = value
      .split(VALUES_REG)
      .map(v => v.trim())
      .map(v => this.__parseLayer(v))
      .filter(Boolean);

    return result;
  }

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
  }

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
  }

  getStyle(opts) {
    return this.getStyleFromLayers(opts);
  }

  getStyleFromLayers(opts) {
    let result = {};
    const name = this.getName();
    const layers = this.getLayers();
    const props = this.getProperties();
    const styles = layers.map(l => this.getStyleFromLayer(l, opts));
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
      !layers.length &&
        props.map(prop => {
          result[prop.getName()] = '';
        });
    } else {
      const style = props.reduce((acc, prop) => {
        acc[prop.getName()] = '';
        return acc;
      }, {});
      result[name] = result[name] || '';
      result = { ...result, ...style };
    }

    return result;
  }

  __getJoinLayers() {
    const join = this.get('layerJoin');
    const sep = this.get('layerSeparator');

    return join || (isString(sep) ? sep : join);
  }

  __getFullValue() {
    if (this.get('detached')) return '';
    const style = this.getStyleFromLayers();

    return style[this.getName()];
  }

  getFullValue() {
    return this.get('detached') ? '' : this.get('layers').getFullValue();
  }

  getValueFromStyle(styles = {}) {
    const layers = this.getLayers().getLayersFromStyle(styles);
    return new Layers(layers).getFullValue();
  }

  clearValue() {
    this.getLayers().reset();
    return PropertyComposite.prototype.clearValue.apply(this, arguments);
  }

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
  }

  /**
   * Extended
   * @private
   */
  hasValue(opts = {}) {
    const { noParent } = opts;
    const parentValue = noParent && this.getParentTarget();
    return this.getLayers().length > 0 && !parentValue;
  }

  /**
   * Extended
   * @private
   */
  clear(opts = {}) {
    this.getLayers().reset();
    this.__upTargetsStyleProps(opts);
    return PropertyBase.prototype.clear.call(this);
  }

  getCurrentLayer() {
    return this.getLayers().filter(layer => layer.get('active'))[0];
  }

  /**
   * This method allows to customize layers returned from the target
   * @param  {Object} target
   * @return {Array} Should return an array of layers
   * @private
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
}
