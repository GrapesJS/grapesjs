import { Model } from 'common';
import { camelCase } from 'utils/mixins';
import Properties from './Properties';

export default class Layer extends Model {
  defaults() {
    return {
      index: '',
      value: '',
      values: {},
      active: false,
      preview: false,
      properties: [],
    };
  }

  initialize() {
    this.prop = this.collection.prop;
    // const prp = this.get('properties');
    // var value = this.get('value');
    // this.set('properties', prp instanceof Properties ? prp : new Properties(prp));
    // const props = this.get('properties');
    // props.forEach(this.onPropAdd, this);
    // this.listenTo(props, 'add', this.onPropAdd);

    // // If there is no value I'll try to get it from values
    // // I need value setted to make preview working
    // if (!value) {
    //   var val = '';
    //   var values = this.get('values');

    //   for (var prop in values) {
    //     val += ' ' + values[prop];
    //   }

    //   this.set('value', val.trim());
    // }
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
  getValues(opts = {}) {
    const values = this.get('values');

    return opts.camelCase
      ? Object.keys(values).reduce((res, key) => {
          res[camelCase(key)] = values[key];
          return res;
        }, {})
      : values;
  }

  /**
   * Get layer label.
   * @returns {String}
   */
  getLabel() {
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
  move(index) {
    return this.prop?.moveLayer(this, index);
  }

  upValues(props = {}) {
    return this.set('values', {
      ...this.getValues(),
      ...props,
    });
  }

  onPropAdd(prop) {
    const coll = this.collection;
    prop.parent = coll && coll.property;
  }

  getPropertyAt(index) {
    return this.get('properties').at(index);
  }

  getPropertyValue(property) {
    let result = '';
    this.get('properties').each(prop => {
      if (prop.get('property') == property) {
        result = prop.getFullValue();
      }
    });
    return result;
  }

  getFullValue() {
    let result = [];
    this.get('properties').each(prop => result.push(prop.getFullValue()));
    return result.join(' ').trim();
  }
}
