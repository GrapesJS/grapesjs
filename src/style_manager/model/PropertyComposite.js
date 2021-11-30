import { isString } from 'underscore';
import Property from './Property';

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

    // Separator to use to split property values (only for not detached properties)
    separator: ' ',

    // Separator to use to join property values (only for not detached properties)
    join: null,
  },

  initialize(props = {}, opts = {}) {
    Property.callParentInit(Property, this, props, opts);
    const { em } = this;
    const Properties = require('./Properties').default;
    const properties = new Properties(this.get('properties') || [], { em, parentProp: this });
    this.set('properties', properties, { silent: 1 });
    this.listenTo(properties, 'change', this.__upProperties);
    this.listenTo(this, 'change:value', this.updateValues);
    Property.callInit(this, props, opts);
  },

  __upProperties(prop, opts = {}) {
    if (!this.__hasCustom()) return;

    if (this.get('detached')) {
      this.__upTargetsStyle({ [prop.getName()]: prop.__getFullValue() }, opts);
    } else {
      this.upValue(this.__getFullValue(), opts);
    }
  },

  __getFullValue() {
    if (this.get('detached')) return '';
    // TODO custom build of the value (eg. toValue({ values }), toStyle({ values, name }) )
    // const values = this.getValues();

    return this.getProperties()
      .map(p => p.__getFullValue({ withDefault: 1 }))
      .filter(Boolean)
      .join(this.__getJoin());
  },

  __getJoin() {
    const join = this.get('join');
    return isString(join) ? join : this.get('separator');
  },

  clear() {
    this.getProperties().map(p => p.clear());
    return Property.prototype.clear.apply(this, arguments);
  },

  /**
   * Get current values of properties
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.byName=false] Use property name as key instead of ID
   * @returns {Object}
   */
  getValues({ byName } = {}) {
    return this.getProperties().reduce((res, prop) => {
      const key = byName ? prop.getName() : prop.getId();
      res[key] = `${prop.__getFullValue({ withDefault: 1 })}`;
      return res;
    }, {});
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
      const value = values[i] || values[(i % len) + (len != 1 && len % 2 ? 1 : 0)];
      // There some issue with UndoManager
      //property.setValue(value, 0, {fromParent: 1});
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
  },

  isDetached() {
    return !!this.get('detached');
  },

  getProperties() {
    return [...this.get('properties').models];
  },

  getProperty(id) {
    return this.get('properties').filter(prop => prop.get('id') === id)[0] || null;
  },
});
