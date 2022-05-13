import { isString, isUndefined, keys } from 'underscore';
import Property from './Property';
import Properties from './Properties';

export const isNumberType = type => type === 'integer' || type === 'number';

/**
 *
 * [Property]: property.html
 *
 *
 * @typedef PropertyComposite
 * @property {Array<Object>} properties Array of sub properties, eg. `[{ type: 'number', property: 'margin-top' }, ...]`
 * @property {Boolean} [detached=false] Indicate if the final CSS property is splitted (detached: `margin-top: X; margin-right: Y; ...`) or combined (not detached: `margin: X Y ...;`)
 * @property {String|RegExp} [separator=' '] Value used to split property values, default `" "`.
 * @property {String} [join=' '] Value used to join property values, default `" "`.
 * @property {Function} [fromStyle] Custom logic for getting property values from the target style object.
 * \n
 * ```js
 *  fromStyle: (style) => {
 *    const margins = parseMarginShorthand(style.margin);
 *    return {
 *      'margin-top': margins.top,
 *      // ...
 *    };
 *  }
 * ```
 * @property {Function} [toStyle] Custom logic for creating the CSS style object to apply on selected targets.
 * \n
 * ```js
 *  toStyle: (values) => {
 *    const top = values['margin-top'] || 0;
 *    const right = values['margin-right'] || 0;
 *    // ...
 *    return {
 *      margin: `${top} ${right} ...`,
 *    };
 *  }
 * ```
 */
export default class PropertyComposite extends Property {
  defaults() {
    return {
      ...Property.getDefaults(),
      detached: false,
      properties: [],
      separator: ' ',
      join: null,
      fromStyle: null,
      toStyle: null,
      full: true,
    };
  }

  initialize(props = {}, opts = {}) {
    Property.callParentInit(Property, this, props, opts);
    const { em } = this;
    const properties = new Properties(this.get('properties') || [], {
      em,
      parentProp: this,
    });
    this.set('properties', properties, { silent: 1 });
    this.listenTo(properties, 'change', this.__upProperties);
    Property.callInit(this, props, opts);
  }

  /**
   * Get properties.
   * @returns {Array<[Property]>}
   */
  getProperties() {
    return [...this.get('properties').models];
  }

  /**
   * Get property by id.
   * @param  {String} id Property id.
   * @returns {[Property]|null}
   */
  getProperty(id) {
    return this.get('properties').filter(prop => prop.getId() === id || prop.getName() === id)[0] || null;
  }

  /**
   * Get property at index.
   * @param  {Number} index
   * @returns {[Property]|null}
   */
  getPropertyAt(index) {
    return this.get('properties').at(index);
  }

  /**
   * Check if the property is detached.
   * @returns {Boolean}
   */
  isDetached() {
    return !!this.get('detached');
  }

  /**
   * Get current values of properties.
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.byName=false] Use property names as a key instead of the id.
   * @returns {Object}
   * @example
   * // In case the property is `margin` with sub properties like `margin-top`, `margin-right`, etc.
   * console.log(property.getValues());
   * // { 'margin-top': '10px', 'margin-right': '20px', ... };
   */
  getValues({ byName } = {}) {
    return this.getProperties().reduce((res, prop) => {
      const key = byName ? prop.getName() : prop.getId();
      res[key] = `${prop.__getFullValue()}`;
      return res;
    }, {});
  }

  /**
   * Get property separator.
   * @returns {RegExp}
   */
  getSeparator() {
    return this.getSplitSeparator();
  }

  /**
   * Get the join value.
   * @returns {String}
   */
  getJoin() {
    return this.__getJoin();
  }

  /**
   * Get style object from current properties
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.camelCase] Return property names in camelCase.
   * @returns {Object} Style object
   * @private
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
  }

  getSplitSeparator() {
    return new RegExp(`${this.get('separator')}(?![^\\(]*\\))`);
  }

  __upProperties(p, opts = {}) {
    if (opts.__up || opts.__clearIn) return;

    const parentProp = this.__getParentProp();
    if (parentProp) return parentProp.__upProperties(this, opts);

    this.__upTargetsStyleProps(opts, p);
  }

  __upTargetsStyleProps(opts = {}, prop) {
    let style = this.getStyleFromProps();

    if (this.isDetached() && prop) {
      const name = prop.getName();
      style = { [name]: style[name] };
    }

    this.__upTargetsStyle(style, opts);
  }

  _up(props, opts = {}) {
    this.__setProperties(this.__getSplitValue(props.value), opts);
    return Property.prototype._up.call(this, props, opts);
  }

  getStyle(opts) {
    return this.getStyleFromProps(opts);
  }

  __getFullValue(opts = {}) {
    if (this.isDetached() || opts.__clear) return '';

    return this.getStyleFromProps()[this.getName()] || '';
  }

  __getJoin() {
    const join = this.get('join');
    return isString(join) ? join : this.get('separator');
  }

  __styleHasProps(style = {}) {
    const name = this.getName();
    const props = this.getProperties();
    const nameProps = props.map(prop => prop.getName());
    const allNameProps = [name, ...nameProps];
    return allNameProps.some(prop => !isUndefined(style[prop]) && style[prop] !== '');
  }

  __splitValue(value, sep) {
    return value
      .split(sep)
      .map(value => value.trim())
      .filter(Boolean);
  }

  __splitStyleName(style, name, sep) {
    return this.__splitValue(style[name] || '', sep);
  }

  __getSplitValue(value = '', { byName } = {}) {
    const props = this.getProperties();
    const props4Nums = props.length === 4 && props.every(prop => isNumberType(prop.getType()));
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

      const key = byName ? prop.getName() : prop.getId();
      result[key] = res || '';
    });

    return result;
  }

  __getPropsFromStyle(style = {}, opts = {}) {
    if (!this.__styleHasProps(style)) return null;

    const { byName } = opts;
    const name = this.getName();
    const props = this.getProperties();
    const sep = this.getSplitSeparator();
    const fromStyle = this.get('fromStyle');
    let result = fromStyle ? fromStyle(style, { property: this, name, separator: sep }) : {};

    if (!fromStyle) {
      // Get props from the main property
      result = this.__getSplitValue(style[name] || '', { byName });

      // Get props from the inner properties
      props.forEach(prop => {
        const value = style[prop.getName()];
        const key = byName ? prop.getName() : prop.getId();
        if (!isUndefined(value) && value !== '') result[key] = value;
      });
    }

    return result;
  }

  __setProperties(values = {}, opts = {}) {
    this.getProperties().forEach(prop => {
      const value = values[prop.getId()];
      prop.__getFullValue() !== value && prop.upValue(value, opts);
    });

    // Keep track of the values, otherwise clear() will not trigger changes.
    const valuesStr = keys(values)
      .map(k => values[k])
      .join(' ');
    this.set('value', valuesStr, { silent: true });
  }

  clear() {
    this.getProperties().map(p => p.clear({ __clearIn: !this.isDetached() }));
    return Property.prototype.clear.call(this);
  }

  hasValue(opts) {
    return this.getProperties().some(prop => prop.hasValue(opts));
  }

  getFullValue() {
    return this.__getFullValue();
  }

  __canClearProp(prop) {
    return this.isDetached() && prop.hasValue({ noParent: true });
  }
}
