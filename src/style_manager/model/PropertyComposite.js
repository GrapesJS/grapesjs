import { isString, isUndefined } from 'underscore';
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

    fromStyle: null,

    toStyle: null,
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

  __upProperties(p, opts = {}) {
    if (!this.__hasCustom() || opts.__up || opts.__clearIn) return;

    const parentProp = this.__getParentProp();
    if (parentProp) return parentProp.__upProperties(this, opts);

    this.__upTargetsStyleProps(opts, p);
  },

  __upTargetsStyleProps(opts = {}, prop) {
    let style = this.getStyleFromProps();

    if (this.isDetached() && prop) {
      const name = prop.getName();
      style = { [name]: style[name] };
    }

    this.__upTargetsStyle(style, opts);
  },

  _up(props, opts = {}) {
    this.__setProperties(this.__getSplitValue(props.value), opts);
    return Property.prototype._up.call(this, props, opts);
  },

  getStyle(opts) {
    return this.getStyleFromProps(opts);
  },

  /**
   * Get style object from current properties
   * @returns {Object} Style object
   */
  getStyleFromProps(opts = {}) {
    const name = this.getName();
    const join = this.__getJoin();
    const toStyle = this.get('toStyle');
    let values = this.getValues();
    let style = {};

    if (toStyle) {
      style = toStyle(values, { join, name, property: this });
    } else {
      values = this.getValues({ byName: true });

      if (this.isDetached()) {
        style = values;
      } else {
        const value = this.getProperties()
          .map(p => p.__getFullValue({ withDefault: 1 }))
          .filter(Boolean)
          .join(join);
        style = { [name]: value };
      }
    }

    if (this.isDetached()) {
      style[name] = '';
    } else {
      style[name] = style[name] || '';
      style = {
        ...style,
        ...this.getProperties().reduce((acc, prop) => {
          acc[prop.getName()] = '';
          return acc;
        }, {}),
      };
    }

    return opts.camelCase
      ? Object.keys(style).reduce((res, key) => {
          res[camelCase(key)] = style[key];
          return res;
        }, {})
      : style;
  },

  __getFullValue(opts = {}) {
    if (this.isDetached() || opts.__clear) return '';

    return this.getStyleFromProps()[this.getName()] || '';
  },

  __getJoin() {
    const join = this.get('join');
    return isString(join) ? join : this.get('separator');
  },

  __styleHasProps(style = {}) {
    const name = this.getName();
    const props = this.getProperties();
    const nameProps = props.map(prop => prop.getName());
    const allNameProps = [name, ...nameProps];
    return allNameProps.some(prop => !isUndefined(style[prop]) && style[prop] !== '');
  },

  __splitValue(value, sep) {
    return value
      .split(sep)
      .map(value => value.trim())
      .filter(Boolean);
  },

  __splitStyleName(style, name, sep) {
    return this.__splitValue(style[name] || '', sep);
  },

  __getSplitValue(value = '') {
    const props = this.getProperties();
    const props4Nums = props.length === 4 && props.every(prop => prop.getType() === 'integer');
    const values = this.__splitValue(value, this.getSplitSeparator());
    const result = {};

    props.forEach((prop, i) => {
      const value = values[i];
      let res = !isUndefined(value) ? value : ''; // : prop.getDefaultValue();

      if (props4Nums) {
        // Try to get value from a shorthand:
        // 11px -> 11px 11px 11px 11xp
        // 11px 22px -> 11px 22px 11px 22xp
        const len = values.length;
        res = values[i] || values[(i % len) + (len != 1 && len % 2 ? 1 : 0)] || res;
      }

      result[prop.getId()] = res || '';
    });

    return result;
  },

  __getPropsFromStyle(style = {}) {
    if (!this.__styleHasProps(style)) return null;

    const props = this.getProperties();
    const sep = this.getSplitSeparator();
    const fromStyle = this.get('fromStyle');
    let result = fromStyle ? fromStyle(style, { property: this, separator: sep }) : {};

    if (!fromStyle) {
      // Get props from the main property
      result = this.__getSplitValue(style[this.getName()] || '');

      // Get props from the inner properties
      props.forEach(prop => {
        const value = style[prop.getName()];
        if (!isUndefined(value) && value !== '') result[prop.getId()] = value;
      });
    }

    return result;
  },

  __setProperties(values = {}, opts = {}) {
    this.getProperties().forEach(prop => {
      const value = values[prop.getId()];
      prop.__getFullValue() !== value && prop.upValue(value, opts);
    });
  },

  clear() {
    this.getProperties().map(p => p.clear({ __clearIn: !this.isDetached() }));
    return Property.prototype.clear.call(this);
  },

  hasValue(opts) {
    return this.getProperties().some(prop => prop.hasValue(opts));
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
      res[key] = `${prop.__getFullValue()}`;
      return res;
    }, {});
  },

  /**
   * Clear the value
   * @return {this}
   * @deprecated
   */
  clearValue(opts = {}) {
    this.get('properties').each(property => property.clearValue());
    return Property.prototype.clearValue.apply(this, arguments);
  },

  /**
   * Update property values
   * @deprecated
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
