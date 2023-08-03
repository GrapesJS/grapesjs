import { isArray, isNumber, isString, isUndefined, keys } from 'underscore';
import { StyleProps, getLastStyleValue } from '../../domain_abstract/model/StyleableModel';
import { camelCase } from '../../utils/mixins';
import Layer, { LayerProps, LayerValues } from './Layer';
import Layers from './Layers';
import { OptionsStyle, OptionsUpdate, default as Property, default as PropertyBase } from './Property';
import PropertyComposite, {
  FromStyle,
  FromStyleData,
  PropValues,
  PropertyCompositeProps,
  ToStyle,
  ToStyleData,
  isNumberType,
} from './PropertyComposite';
import PropertyNumber from './PropertyNumber';

const VALUES_REG = /,(?![^\(]*\))/;
const PARTS_REG = /\s(?![^(]*\))/;

type ToStyleDataStack = Omit<ToStyleData, 'property'> & { joinLayers: string; layer: Layer; property: PropertyStack };

type FromStyleDataStack = Omit<FromStyleData, 'property' | 'separator'> & {
  property: PropertyStack;
  separatorLayers: RegExp;
};

export type OptionStyleStack = OptionsStyle & { number?: { min?: number; max?: number } };

/** @private */
export interface PropertyStackProps extends Omit<PropertyCompositeProps, 'toStyle' | 'fromStyle'> {
  layers?: LayerProps[];

  /**
   * The separator used to split layer values.
   */
  layerSeparator?: string | RegExp;

  /**
   * Value used to join layer values.
   */
  layerJoin?: string;

  /**
   * Indicate if the layer should display a preview.
   */
  preview?: boolean;

  /**
   * Custom logic for creating layer labels.
   */
  layerLabel?: (layer: Layer, data: { index: number; values: LayerValues; property: PropertyStack }) => string;
  toStyle?: (values: PropValues, data: ToStyleDataStack) => ReturnType<ToStyle>;
  fromStyle?: (style: StyleProps, data: FromStyleDataStack) => ReturnType<FromStyle>;
  parseLayer?: (data: { value: string; values: PropValues }) => PropValues;
  selectedLayer?: Layer;
  prepend?: boolean;
  __layers?: PropValues[];
}

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
export default class PropertyStack extends PropertyComposite<PropertyStackProps> {
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

  initialize(props = {}, opts = {}) {
    // @ts-ignore
    PropertyComposite.callParentInit(PropertyComposite, this, props, opts);
    const layers = this.get('layers');
    const layersColl = new Layers(layers, { prop: this });
    // @ts-ignore
    layersColl.property = this;
    // @ts-ignore
    layersColl.properties = this.get('properties');
    this.set('layers', layersColl as any, { silent: true });
    this.on('change:selectedLayer', this.__upSelected);
    this.listenTo(layersColl, 'add remove', this.__upLayers);
    // @ts-ignore
    PropertyComposite.callInit(this, props, opts);
  }

  /**
   * Get all available layers.
   * @returns {Array<[Layer]>}
   */
  getLayers() {
    return this.__getLayers().models;
  }

  __getLayers() {
    return this.get('layers') as unknown as Layers;
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
  getLayer(index = 0): Layer | undefined {
    return this.__getLayers().at(index) || undefined;
  }

  /**
   * Get selected layer.
   * @returns {[Layer] | undefined}
   */
  getSelectedLayer() {
    const layer = this.get('selectedLayer');
    return layer && layer.getIndex() >= 0 ? layer : undefined;
  }

  /**
   * Select layer.
   * Without a selected layer any update made on inner properties has no effect.
   * @param {[Layer]} layer Layer to select
   * @example
   * const layer = property.getLayer(0);
   * property.selectLayer(layer);
   */
  selectLayer(layer: Layer) {
    return this.set('selectedLayer', layer, { __select: true } as any);
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
   * Move layer by index.
   * @param {[Layer]} layer Layer to move.
   * @param {Number} index New layer index.
   * @example
   * const layer = property.getLayer(1);
   * property.moveLayer(layer, 0);
   */
  moveLayer(layer: Layer, index = 0) {
    const currIndex = layer ? layer.getIndex() : -1;

    if (currIndex >= 0 && isNumber(index) && index >= 0 && index < this.getLayers().length && currIndex !== index) {
      this.removeLayer(layer);
      this.__getLayers().add(layer, { at: index });
    }
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
  addLayer(props: LayerValues = {}, opts = {}) {
    const values: LayerValues = {};
    this.getProperties().forEach(prop => {
      const key = prop.getId();
      const value = props[key];
      values[key] = isUndefined(value) ? prop.getDefaultValue() : value;
    });
    const layer = this.__getLayers().push({ values } as any, opts);

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
  removeLayer(layer: Layer) {
    return this.__getLayers().remove(layer);
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
  getLayerLabel(layer: Layer) {
    let result = '';

    if (layer) {
      const layerLabel = this.get('layerLabel');
      const values = layer.getValues();
      const index = layer.getIndex();

      if (layerLabel) {
        result = layerLabel(layer, { index, values, property: this });
      } else {
        const parts: string[] = [];
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
   * @param {Object} [opts.number] Limit the result of the number types, eg. `number: { min: -3, max: 3 }`
   * @returns {Object} Style object
   */
  getStyleFromLayer(layer: Layer, opts: OptionStyleStack = {}) {
    const join = this.__getJoin();
    const joinLayers = this.__getJoinLayers();
    const toStyle = this.get('toStyle');
    const name = this.getName();
    const values = layer.getValues();
    let style: StyleProps;

    if (toStyle) {
      style = toStyle(values, {
        join,
        joinLayers,
        name,
        layer,
        property: this,
      });
    } else {
      const result = this.getProperties().map(prop => {
        const name = prop.getName();
        const val = values[prop.getId()];
        let value = isUndefined(val) ? prop.getDefaultValue() : val;

        // Limit number values if necessary (useful for previews)
        if (opts.number && isNumberType(prop.getType())) {
          const newVal = (prop as PropertyNumber).parseValue(val, opts.number);
          value = `${newVal.value}${newVal.unit}`;
        }

        return { name, value };
      });
      style = this.isDetached()
        ? result.reduce((acc, item) => {
            acc[item.name] = item.value;
            return acc;
          }, {} as StyleProps)
        : {
            [this.getName()]: result.map(r => r.value).join(join),
          };
    }

    return opts.camelCase
      ? Object.keys(style).reduce((res, key) => {
          res[camelCase(key)] = style[key];
          return res;
        }, {} as StyleProps)
      : style;
  }

  /**
   * Get preview style object from the layer.
   * If the property has `preview: false` the returned object will be empty.
   * @param {[Layer]} layer
   * @param {Object} [opts={}] Options. Same of `getStyleFromLayer`
   * @returns {Object} Style object
   */
  getStylePreview(layer: Layer, opts: OptionStyleStack = {}) {
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
    const sep = this.get('layerSeparator')!;
    return isString(sep) ? new RegExp(`${sep}(?![^\\(]*\\))`) : sep;
  }

  __upProperties(prop: Property, opts: any = {}) {
    const layer = this.getSelectedLayer();
    if (!layer) return;
    layer.upValues({ [prop.getId()]: prop.__getFullValue() });
    if (opts.__up) return;
    this.__upTargetsStyleProps(opts);
  }

  __upLayers(m: any, c: any, o: any) {
    this.__upTargetsStyleProps(o || c);
  }

  __upTargets(p: this, opts: any = {}): void {
    if (opts.__select) return;
    return PropertyBase.prototype.__upTargets.call(this, p as any, opts);
  }

  __upTargetsStyleProps(opts = {}) {
    this.__upTargetsStyle(this.getStyleFromLayers(), opts);
  }

  __upTargetsStyle(style: StyleProps, opts: any) {
    return PropertyBase.prototype.__upTargetsStyle.call(this, style, opts);
  }

  __upSelected({ noEvent }: { noEvent?: boolean } = {}, opts: OptionsUpdate = {}) {
    const sm = this.em.Styles;
    const selected = this.getSelectedLayer();
    const values = selected?.getValues();

    // Update properties by layer value
    values &&
      this.getProperties().forEach(prop => {
        const value = values[prop.getId()] ?? '';
        prop.__getFullValue() !== value && prop.upValue(value, { ...opts, __up: true });
      });

    !noEvent && sm.__trgEv(sm.events.layerSelect, { property: this });
  }

  // @ts-ignore
  _up(props: Partial<PropertyStackProps>, opts: OptionsUpdate = {}) {
    const { __layers = [], ...rest } = props;
    // Detached props will update their layers later in sm.__upProp
    !this.isDetached() && this.__setLayers(__layers);
    this.__upSelected({ noEvent: true }, opts);
    PropertyBase.prototype._up.call(this, rest, opts);
    return this;
  }

  __setLayers(newLayers: PropValues[] = []) {
    const layers = this.__getLayers();
    const layersNew = newLayers.map(values => ({ values }));

    if (layers.length === layersNew.length) {
      layersNew.map((layer, n) => layers.at(n)?.upValues(layer.values));
    } else {
      this.__getLayers().reset(layersNew);
    }

    this.__upSelected({ noEvent: true });
  }

  __parseValue(value: string) {
    const result = this.parseValue(value);
    result.__layers = value
      .split(VALUES_REG)
      .map(v => v.trim())
      .map(v => this.__parseLayer(v))
      .filter(Boolean);

    return result;
  }

  __parseLayer(value: string) {
    const parseFn = this.get('parseLayer');
    const values = value.split(PARTS_REG);
    const properties = this.getProperties();
    return parseFn
      ? parseFn({ value, values })
      : properties.reduce((acc, prop, i) => {
          const value = values[i];
          acc[prop.getId()] = !isUndefined(value) ? value : prop.getDefaultValue();
          return acc;
        }, {} as PropValues);
  }

  __getLayersFromStyle(style: StyleProps = {}) {
    if (!this.__styleHasProps(style)) return null;

    const name = this.getName();
    const props = this.getProperties();
    const sep = this.getLayerSeparator();
    const fromStyle = this.get('fromStyle');
    let result = fromStyle ? fromStyle(style, { property: this, name, separatorLayers: sep }) : [];

    if (!fromStyle) {
      // Get layers from the main property
      const layers = this.__splitStyleName(style, name, sep)
        .map(value => value.split(this.getSplitSeparator()))
        .map(parts => {
          const result: PropValues = {};
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

  getStyle(opts: OptionStyleStack = {}) {
    return this.getStyleFromLayers(opts);
  }

  getStyleFromLayers(opts: OptionStyleStack = {}) {
    let result: StyleProps = {};
    const name = this.getName();
    const layers = this.getLayers();
    const props = this.getProperties();
    const styles = layers.map(l => this.getStyleFromLayer(l, opts));
    styles.forEach(style => {
      keys(style).map(key => {
        if (!result[key]) {
          // @ts-ignore
          result[key] = [];
        }
        // @ts-ignore
        result[key].push(style[key]);
      });
    });
    keys(result).map(key => {
      // @ts-ignore
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
      }, {} as StyleProps);
      result[name] = result[name] || '';
      result = { ...result, ...style };
    }

    return result;
  }

  __getJoinLayers() {
    const join = this.get('layerJoin')!;
    const sep = this.get('layerSeparator');

    return join || (isString(sep) ? sep : join);
  }

  __getFullValue() {
    if (this.get('detached')) return '';
    const style = this.getStyleFromLayers();

    return getLastStyleValue(style[this.getName()]);
  }

  /**
   * Extended
   * @private
   */
  hasValue(opts: { noParent?: boolean } = {}) {
    const { noParent } = opts;
    const parentValue = noParent && this.getParentTarget();
    return this.getLayers().length > 0 && !parentValue;
  }

  /**
   * Extended
   * @private
   */
  clear(opts = {}) {
    this.__getLayers().reset();
    this.__upTargetsStyleProps(opts);
    PropertyBase.prototype.clear.call(this);
    return this;
  }

  __canClearProp() {
    return false;
  }
}
