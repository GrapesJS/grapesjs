import Property from './Property';
import { isArray } from 'underscore';

export default Property.extend({
  defaults: {
    ...Property.prototype.defaults,
    // 'background' is a good example where to make a difference
    // between detached and not
    //
    // - NOT detached (default)
    // background: url(..) no-repeat center ...;
    // - Detached
    // background-image: url();
    // background-repeat: repeat;
    // ...
    detached: 0,

    // Array of sub properties
    properties: [],

    // Separator between properties
    separator: ' '
  },

  initialize(props = {}, opts = {}) {
    Property.callParentInit(Property, this, props, opts);
    const properties = this.get('properties') || [];
    const Properties = require('./Properties').default;
    if (this.get('value')) {
      const values = this.get('value').split(this.getSplitSeparator());
      for (let index = 0; index < properties.length; index++) {
        if (!values[index]) {
          continue;
        }

        if (isArray(properties)) {
          properties[index]['value'] = values[index];
        }
      }
    }
    this.set('properties', new Properties(properties));
    this.listenTo(this, 'change:value', this.updateValues);
    Property.callInit(this, props, opts);
  },

  /**
   * Clear the value
   * @return {this}
   */
  clearValue(opts = {}) {
    this.get('properties').each(property => property.clearValue());
    return Property.prototype.clearValue.apply(this, arguments);
  },

  /**
   * Update property values
   */
  updateValues() {
    const values = this.getFullValue().split(this.getSplitSeparator());
    this.get('properties').each((property, i) => {
      const len = values.length;
      // Try to get value from a shorthand:
      // 11px -> 11px 11px 11px 11xp
      // 11px 22px -> 11px 22px 11px 22xp
      const value =
        values[i] || values[(i % len) + (len != 1 && len % 2 ? 1 : 0)];
      // There some issue with UndoManager
      property.setValue(value, 0, { fromParent: 1 });
    });
  },

  /**
   * Split by sperator but avoid it inside parenthesis
   * @return {RegExp}
   */
  getSplitSeparator() {
    return new RegExp(`${this.get('separator')}(?![^\\(]*\\))`);
  },

  /**
   * Returns default value
   * @param  {Boolean} defaultProps Force to get defaults from properties
   * @return {string}
   */
  getDefaultValue(defaultProps) {
    let value = this.get('defaults');

    if (value && !defaultProps) {
      return value;
    }

    value = '';
    const properties = this.get('properties');
    properties.each((prop, index) => (value += `${prop.getDefaultValue()} `));
    return value.trim();
  },

  getFullValue() {
    if (this.get('detached')) {
      return '';
    }

    return this.get('properties').getFullValue();
  },

  /**
   * Get property at some index
   * @param  {Number} index
   * @return {Object}
   */
  getPropertyAt(index) {
    return this.get('properties').at(index);
  }
});
