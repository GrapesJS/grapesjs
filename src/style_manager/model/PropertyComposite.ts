import { isArray, isString, isUndefined, keys } from 'underscore';
import { StyleProps, getLastStyleValue } from '../../domain_abstract/model/StyleableModel';
import { camelCase } from '../../utils/mixins';
import Properties from './Properties';
import Property, { OptionsStyle, OptionsUpdate, PropertyProps } from './Property';
import { PropertyNumberProps } from './PropertyNumber';
import { PropertySelectProps } from './PropertySelect';

export const isNumberType = (type: string) => type === 'integer' || type === 'number';

export type PropValues = Record<string, any>;

export type OptionByName = { byName?: boolean };

export type FromStyle = (style: StyleProps, data: FromStyleData) => PropValues;

export type FromStyleData = { property: Property; name: string; separator: RegExp };

export type ToStyle = (values: PropValues, data: ToStyleData) => StyleProps;

export type ToStyleData = { join: string; name: string; property: Property };

/** @private */
export interface PropertyCompositeProps extends PropertyProps {
  detached?: boolean;
  /**
   * Array of sub properties, eg. `[{ type: 'number', property: 'margin-top' }, ...]`
   */
  properties: (PropertyProps | PropertyNumberProps | PropertySelectProps)[];

  /**
   * Value used to split property values, default `" "`.
   */
  separator: string;

  /**
   * Value used to join property values, default `" "`.
   */
  join?: string;

  /**
   * Custom logic for getting property values from the target style object.
   */
  fromStyle?: FromStyle;

  /**
   * Custom logic for creating the CSS style object to apply on selected targets.
   */
  toStyle?: ToStyle;
}

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
export default class PropertyComposite<T extends Record<string, any> = PropertyCompositeProps> extends Property<T> {
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
    // @ts-ignore
    Property.callParentInit(Property, this, props, opts);
    const { em } = this;
    const properties = new Properties(this.get('properties') || [], {
      em,
      parentProp: this,
    });
    this.set('properties', properties, { silent: true });
    this.listenTo(properties, 'change', this.__upProperties);
    // @ts-ignore
    Property.callInit(this, props, opts);
  }

  get properties(): Property[] {
    // @ts-ignore
    return this.get('properties')! || [];
  }

  /**
   * Get properties.
   * @returns {Array<[Property]>}
   */
  getProperties(): Property[] {
    // @ts-ignore
    return [...this.get('properties').models];
  }

  /**
   * Get property by id.
   * @param  {String} id Property id.
   * @returns {[Property]|null}
   */
  getProperty(id: string): Property | undefined {
    return this.properties.filter(prop => prop.getId() === id || prop.getName() === id)[0];
  }

  /**
   * Get property at index.
   * @param  {Number} index
   * @returns {[Property]|null}
   */
  getPropertyAt(index: number) {
    // @ts-ignore
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
  getValues({ byName }: { byName?: boolean } = {}) {
    return this.getProperties().reduce((res, prop) => {
      const key = byName ? prop.getName() : prop.getId();
      res[key] = `${prop.__getFullValue()}`;
      return res;
    }, {} as Record<string, any>);
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
  getStyleFromProps(opts: OptionsStyle = {}) {
    const name = this.getName();
    const join = this.__getJoin();
    const toStyle = this.get('toStyle');
    let values = this.getValues();
    let style: StyleProps = {};

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
        }, {} as StyleProps),
      };
    }

    return opts.camelCase
      ? Object.keys(style).reduce((res, key) => {
          res[camelCase(key)] = style[key];
          return res;
        }, {} as StyleProps)
      : style;
  }

  getSplitSeparator() {
    return new RegExp(`${this.get('separator')}(?![^\\(]*\\))`);
  }

  __upProperties(p: PropertyComposite, opts: any = {}): void {
    if (opts.__up || opts.__clearIn) return;

    const parentProp = this.__getParentProp();
    if (parentProp) return parentProp.__upProperties(this as any, opts);

    this.__upTargetsStyleProps(opts, p);
  }

  __upTargetsStyleProps(opts = {}, prop?: Property) {
    let style = this.getStyleFromProps();

    if (this.isDetached() && prop) {
      const name = prop.getName();
      style = { [name]: style[name] };
    }

    this.__upTargetsStyle(style, opts);
  }

  _up(props: Partial<T>, opts: OptionsUpdate = {}) {
    this.__setProperties(this.__getSplitValue(props.value), opts);
    Property.prototype._up.call(this, props, opts);
    return this;
  }

  getStyle(opts?: { camelCase?: boolean }) {
    return this.getStyleFromProps(opts);
  }

  __getFullValue(opts: any = {}) {
    if (this.isDetached() || opts.__clear) return '';

    const result = this.getStyleFromProps()[this.getName()] || '';

    return getLastStyleValue(result);
  }

  __getJoin() {
    const join = this.get('join')!;
    return isString(join) ? join : this.get('separator')!;
  }

  __styleHasProps(style: StyleProps = {}) {
    const name = this.getName();
    const props = this.getProperties();
    const nameProps = props.map(prop => prop.getName());
    const allNameProps = [name, ...nameProps];
    return allNameProps.some(prop => !isUndefined(style[prop]) && style[prop] !== '');
  }

  __splitValue(value: string | string[], sep: string | RegExp) {
    return getLastStyleValue(value)
      .split(sep)
      .map(value => value.trim())
      .filter(Boolean);
  }

  __splitStyleName(style: StyleProps, name: string, sep: string | RegExp) {
    return this.__splitValue(style[name] || '', sep);
  }

  __getSplitValue(value: string | string[] = '', { byName }: OptionByName = {}) {
    const props = this.getProperties();
    const props4Nums = props.length === 4 && props.every(prop => isNumberType(prop.getType()));
    const values = this.__splitValue(value, this.getSplitSeparator());
    const result: StyleProps = {};

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

  __getPropsFromStyle(style: StyleProps = {}, opts: OptionByName = {}) {
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

  __setProperties(values: Record<string, any> = {}, opts: OptionsUpdate = {}) {
    this.getProperties().forEach(prop => {
      const value = values[prop.getId()];
      prop.__getFullValue() !== value && prop.upValue(value, opts);
    });

    // Keep track of the values, otherwise clear() will not trigger changes.
    const valuesStr = keys(values)
      .map(k => values[k])
      .join(' ');
    this.set('value', valuesStr as any, { silent: true });
  }

  clear() {
    this.getProperties().map(p => p.clear({ __clearIn: !this.isDetached() }));
    Property.prototype.clear.call(this);
    return this;
  }

  hasValue(opts?: Parameters<Property['hasValue']>[0]) {
    return this.getProperties().some(prop => prop.hasValue(opts));
  }

  getFullValue() {
    return this.__getFullValue();
  }

  __canClearProp(prop: Property) {
    return this.isDetached() && prop.hasValue({ noParent: true });
  }
}
