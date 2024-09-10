import { Model } from '../../common';
import { camelCase } from '../../utils/mixins';
import LayerView from '../view/LayerView';
import { OptionStyleStack } from './PropertyStack';

export type LayerValues = Record<string, any>;

export interface LayerProps {
  values: LayerValues;
}

export default class Layer extends Model<LayerProps> {
  prop: any;
  view?: LayerView;

  defaults() {
    return {
      values: {},
    };
  }

  initialize() {
    const cl = this.collection;
    // @ts-ignore
    this.prop = cl?.prop;
  }

  /**
   * Get layer id.
   * @returns {String}
   */
  getId() {
    return this.cid;
  }

  /**
   * Get layer index.
   * @returns {Number}
   */
  getIndex() {
    const coll = this.collection;
    return coll ? coll.indexOf(this) : -1;
  }

  /**
   * Get layer values.
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.camelCase] Return property names in camelCase.
   * @returns {Object}
   */
  getValues(opts: { camelCase?: boolean } = {}) {
    const values = this.get('values')!;

    return opts.camelCase
      ? Object.keys(values).reduce((res, key) => {
          res[camelCase(key)] = values[key];
          return res;
        }, {} as LayerValues)
      : values;
  }

  /**
   * Get layer label.
   * @returns {String}
   */
  getLabel(): string {
    return this.prop?.getLayerLabel(this);
  }

  /**
   * Check if the layer is selected.
   * @returns {Boolean}
   */
  isSelected() {
    return this.prop?.getSelectedLayer() === this;
  }

  /**
   * Select the layer.
   */
  select() {
    return this.prop?.selectLayer(this);
  }

  /**
   * Remove the layer.
   */
  remove() {
    return this.prop?.removeLayer(this);
  }

  /**
   * Move layer to a new index.
   * @param {Number} index New index
   */
  move(index: number) {
    return this.prop?.moveLayer(this, index);
  }

  /**
   * Get style object for the preview.
   * @param {Object} [opts={}] Options. Same of `PropertyStack.getStyleFromLayer`
   * @returns {Object} Style object
   */
  getStylePreview(opts: OptionStyleStack = {}): Record<string, any> {
    return this.prop?.getStylePreview(this, opts);
  }

  /**
   * Check if the property has the preview enabled for this layer.
   * @returns {Boolean}
   */
  hasPreview() {
    return !!this.prop?.get('preview');
  }

  upValues(props: LayerValues = {}) {
    return this.set('values', {
      ...this.getValues(),
      ...props,
    });
  }
}
