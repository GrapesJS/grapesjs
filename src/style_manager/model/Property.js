import { isUndefined, isString, isArray, result, keys, each, includes } from 'underscore';
import { Model } from '../../common';
import { capitalize, camelCase, hasWin } from '../../utils/mixins';

/**
 * @typedef Property
 * @property {String} id Property id, eg. `my-property-id`.
 * @property {String} property Related CSS property name, eg. `text-align`.
 * @property {String} default Defaul value of the property.
 * @property {String} label Label to use in UI, eg. `Text Align`.
 * @property {Function} [onChange] Change callback.
 * \n
 * ```js
 *  onChange: ({ property, from, to }) => {
 *    console.log(`Changed property`, property.getName(), { from, to });
 *  }
 * ```
 *
 */
export default class Property extends Model {
  initialize(props = {}, opts = {}) {
    this.em = opts.em;
    const id = this.get('id') || '';
    const name = this.get('name') || this.get('label') || '';
    !this.get('property') && this.set('property', (name || id).replace(/ /g, '-'));
    const prop = this.get('property');
    !this.get('id') && this.set('id', prop);
    !name && this.set('name', capitalize(prop).replace(/-/g, ' '));
    this.on('change', this.__upTargets);
    Property.callInit(this, props, opts);
  }

  __getParentProp() {
    return this.collection?.opts?.parentProp;
  }

  __upTargets(p, opts = {}) {
    const { em } = this;
    const sm = em.get('StyleManager');
    const name = this.getName();
    const isClear = opts.__clear;
    const value = isClear ? '' : this.__getFullValue(opts);
    const parentProp = this.__getParentProp();

    const to = this.changedAttributes();
    const from = keys(to).reduce((a, i) => {
      a[i] = this.previous(i);
      return a;
    }, {});

    const kProps = [...keys(this.__getClearProps()), '__p'];
    const toProps = keys(to);
    const applyStyle = !opts.__up && !parentProp && (isClear || kProps.some(k => toProps.indexOf(k) >= 0));
    const onChange = this.get('onChange');
    const evOpts = { property: this, from, to, value, opts };
    sm.__trgEv(sm.events.propertyUpdate, evOpts);
    onChange && onChange(evOpts);
    applyStyle && this.__upTargetsStyle({ [name]: value }, opts);
  }

  __upTargetsStyle(style, opts) {
    const sm = this.em?.get('StyleManager');
    sm?.addStyleTargets({ ...style, __p: !!opts.avoidStore }, opts);
  }

  _up(props, opts = {}) {
    if (opts.noTarget) opts.__up = true;
    const { partial, ...rest } = opts;
    props.__p = !!(rest.avoidStore || partial);
    return this.set(props, { ...rest, avoidStore: props.__p });
  }

  up(props, opts = {}) {
    this.set(props, { ...opts, __up: true });
  }

  init() {}

  /**
   * Get property id.
   * @returns {String}
   */
  getId() {
    return this.get('id');
  }

  /**
   * Get the property type.
   * The type of the property is defined on property creation and based on its value the proper Property class is assigned.
   * The default type is `base`.
   * @returns {String}
   */
  getType() {
    return this.get('type');
  }

  /**
   * Get name (the CSS property name).
   * @returns {String}
   */
  getName() {
    return this.get('property');
  }

  /**
   * Get property label.
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.locale=true] Use the locale string from i18n module
   * @returns {String}
   */
  getLabel(opts = {}) {
    const { locale = true } = opts;
    const id = this.getId();
    const name = this.get('name') || this.get('label');
    return (locale && this.em?.t(`styleManager.properties.${id}`)) || name;
  }

  /**
   * Get property value.
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.noDefault=false] Avoid returning the default value
   * @returns {String}
   */
  getValue(opts = {}) {
    const { noDefault } = opts;
    const val = this.get('value');
    return !this.hasValue() && !noDefault ? this.getDefaultValue() : val;
  }

  /**
   * Check if the property has value.
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.noParent=false] Ignore the value if it comes from the parent target.
   * @returns {Boolean}
   */
  hasValue(opts = {}) {
    const { noParent } = opts;
    const parentValue = noParent && this.getParentTarget();
    const val = this.get('value');
    return !isUndefined(val) && val !== '' && !parentValue;
  }

  /**
   * Indicates if the current value is coming from a parent target (eg. another CSSRule).
   * @returns {Boolean}
   */
  hasValueParent() {
    return this.hasValue() && !this.hasValue({ noParent: true });
  }

  /**
   * Get the CSS style object of the property.
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.camelCase] Return property name in camelCase.
   * @return {Object}
   * @example
   * // In case the property is `color` with a value of `red`.
   * console.log(property.getStyle());
   * // { color: 'red' };
   */
  getStyle(opts = {}) {
    const name = this.getName();
    const key = opts.camelCase ? camelCase(name) : name;
    return { [key]: this.__getFullValue(opts) };
  }

  /**
   * Get the default value.
   * @return {string}
   */
  getDefaultValue() {
    const def = this.get('default');
    return `${!isUndefined(def) ? def : this.get('defaults')}`;
  }

  /**
   * Update the value.
   * The change is also propagated to the selected targets (eg. CSS rule).
   * @param {String} value New value
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.partial=false] If `true` the update on targets won't be considered complete (not stored in UndoManager)
   * @param {Boolean} [opts.noTarget=false] If `true` the change won't be propagated to selected targets.
   */
  upValue(value, opts = {}) {
    const parsed = value === null || value === '' ? this.__getClearProps() : this.__parseValue(value, opts);
    return this._up(parsed, opts);
  }

  /**
   * Check if the property is visible
   * @returns {Boolean}
   */
  isVisible() {
    return !!this.get('visible');
  }

  /**
   * Clear the value.
   * The change is also propagated to the selected targets (eg. the css property is cleared).
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.noTarget=false] If `true` the change won't be propagated to selected targets.
   */
  clear(opts = {}) {
    this._up(this.__getClearProps(), { ...opts, __clear: true });
  }

  /**
   * Indicates if the current value comes directly from the selected target and so can be cleared.
   * @returns {Boolean}
   */
  canClear() {
    const parent = this.getParent();
    return parent ? parent.__canClearProp(this) : this.hasValue({ noParent: true });
  }

  /**
   * If the current property is a sub-property, this will return the parent Property.
   * @returns {[Property]|null}
   */
  getParent() {
    return this.__getParentProp() || null;
  }

  /**
   * Indicates if the property is full-width in UI.
   * @returns {Boolean}
   */
  isFull() {
    return !!this.get('full');
  }

  __parseValue(value, opts) {
    return this.parseValue(value, opts);
  }

  __getClearProps() {
    return { value: '' };
  }

  /**
   * Update value
   * @param {any} value
   * @param {Boolen} [complete=true] Indicates if it's a final state
   * @param {Object} [opts={}] Options
   * @private
   */
  setValue(value, complete = 1, opts = {}) {
    const parsed = this.parseValue(value);
    const avoidStore = !complete;
    !avoidStore && this.set({ value: undefined }, { avoidStore, silent: true });
    this.set(parsed, { avoidStore, ...opts });
  }

  /**
   * Like `setValue` but, in addition, prevents the update of the input element
   * as the changes should come from the input itself.
   * This method is useful with the definition of custom properties
   * @param {any} value
   * @param {Boolen} [complete=true] Indicates if it's a final state
   * @param {Object} [opts={}] Options
   * @private
   * @deprecated
   */
  setValueFromInput(value, complete, opts = {}) {
    this.setValue(value, complete, { ...opts, fromInput: 1 });
  }

  /**
   * Parse a raw value, generally fetched from the target, for this property
   * @param  {string} value Raw value string
   * @return {Object}
   * @private
   * @example
   * // example with an Input type
   * prop.parseValue('translateX(10deg)');
   * // -> { value: 10, unit: 'deg', functionName: 'translateX' }
   *
   */
  parseValue(value, opts = {}) {
    const result = { value };
    const imp = '!important';

    if (isString(value) && value.indexOf(imp) !== -1) {
      result.value = value.replace(imp, '').trim();
      result.important = 1;
    }

    if (!this.get('functionName') && !opts.complete) {
      return result;
    }

    const args = [];
    let valueStr = `${result.value}`;
    let start = valueStr.indexOf('(') + 1;
    let end = valueStr.lastIndexOf(')');
    const functionName = valueStr.substring(0, start - 1);
    if (functionName) result.functionName = functionName;
    args.push(start);

    // Will try even if the last closing parentheses is not found
    if (end >= 0) {
      args.push(end);
    }

    result.value = String.prototype.substring.apply(valueStr, args);

    if (opts.numeric) {
      const num = parseFloat(result.value);
      result.unit = result.value.replace(num, '');
      result.value = num;
    }

    return result;
  }

  /**
   * Helper function to safely split a string of values.
   * Useful when style values are inside functions
   * eg:
   * -> input: 'value(1,2,4), 123, value(4,5)' -- default separator: ','
   * -> output: ['value(1,2,4)', '123', 'value(4,5)']
   * @param {String} values Values to split
   * @param {String} [separator] Separator
   * @private
   */
  // splitValues(values, separator = ',') {
  //   const res = [];
  //   const op = '(';
  //   const cl = ')';
  //   let curr = '';
  //   let acc = 0;

  //   (values || '').split('').forEach(str => {
  //     if (str == op) {
  //       acc++;
  //       curr = curr + op;
  //     } else if (str == cl && acc > 0) {
  //       acc--;
  //       curr = curr + cl;
  //     } else if (str === separator && acc == 0) {
  //       res.push(curr);
  //       curr = '';
  //     } else {
  //       curr = curr + str;
  //     }
  //   });

  //   curr !== '' && res.push(curr);

  //   return res.map(i => i.trim());
  // }

  __getFullValue({ withDefault } = {}) {
    return !this.hasValue() && withDefault ? this.getDefaultValue() : this.getFullValue();
  }

  /**
   * Get a complete value of the property.
   * This probably will replace the getValue when all
   * properties models will be splitted
   * @param {String} val Custom value to replace the one on the model
   * @return {string}
   * @private
   */
  getFullValue(val, opts = {}) {
    const fn = this.get('functionName');
    const def = this.getDefaultValue();
    let value = isUndefined(val) ? this.get('value') : val;
    const hasValue = !isUndefined(value) && value !== '';

    if (value && def && value === def) {
      return def;
    }

    if (fn && hasValue) {
      const fnParameter = fn === 'url' ? `'${value.replace(/'|"/g, '')}'` : value;
      value = `${fn}(${fnParameter})`;
    }

    if (hasValue && this.get('important') && !opts.skipImportant) {
      value = `${value} !important`;
    }

    return value || '';
  }

  __setParentTarget(parentTarget) {
    this.up({ parentTarget });
  }

  getParentTarget() {
    return this.get('parentTarget') || null;
  }

  __parseFn(input = '') {
    const start = input.indexOf('(') + 1;
    const end = input.lastIndexOf(')');

    return {
      name: input.substring(0, start - 1).trim(),
      value: String.prototype.substring.apply(input, [start, end >= 0 ? end : undefined]).trim(),
    };
  }

  __checkVisibility({ target, component, sectors }) {
    const trg = component || target;
    if (!trg) return false;

    const id = this.getId();
    const property = this.getName();
    const toRequire = this.get('toRequire');
    const requires = this.get('requires');
    const requiresParent = this.get('requiresParent');
    const unstylable = trg.get('unstylable');
    const stylableReq = trg.get('stylable-require');
    let stylable = trg.get('stylable');

    // Stylable could also be an array indicating with which property
    // the target could be styled
    if (isArray(stylable)) {
      stylable = stylable.indexOf(property) >= 0;
    }

    // Check if the property was signed as unstylable
    if (isArray(unstylable)) {
      stylable = unstylable.indexOf(property) < 0;
    }

    // Check if the property is available only if requested
    if (toRequire) {
      stylable = !target || (stylableReq && (stylableReq.indexOf(id) >= 0 || stylableReq.indexOf(property) >= 0));
    }

    // Check if the property is available based on other property's values
    if (sectors && requires) {
      const properties = keys(requires);
      sectors.forEach(sector => {
        sector.getProperties().forEach(model => {
          if (includes(properties, model.id)) {
            const values = requires[model.id];
            stylable = stylable && includes(values, model.get('value'));
          }
        });
      });
    }

    // Check if the property is available based on parent's property values
    if (requiresParent) {
      const parent = component && component.parent();
      const parentEl = parent && parent.getEl();
      if (parentEl) {
        const styles = hasWin() ? window.getComputedStyle(parentEl) : {};
        each(requiresParent, (values, property) => {
          stylable = stylable && styles[property] && includes(values, styles[property]);
        });
      } else {
        stylable = false;
      }
    }

    return !!stylable;
  }
}

Property.callParentInit = function (property, ctx, props, opts = {}) {
  property.prototype.initialize.apply(ctx, [
    props,
    {
      ...opts,
      skipInit: 1,
    },
  ]);
};

Property.callInit = function (context, props, opts = {}) {
  !opts.skipInit && context.init(props, opts);
};

Property.getDefaults = function () {
  return result(this.prototype, 'defaults');
};

Property.prototype.defaults = {
  name: '',
  property: '',
  type: '',
  defaults: '',
  info: '',
  value: '',
  icon: '',
  functionName: '',
  status: '',
  visible: true,
  fixedValues: ['initial', 'inherit'],
  onChange: null,

  // If true, the property will be forced to be full width
  full: 0,

  // If true to the value will be added '!important'
  important: 0,

  // If true, will be hidden by default and will show up only for targets
  // which require this property (via `stylable-require`)
  // Use case:
  // you can add all SVG CSS properties with toRequire as true
  // and then require them on SVG Components
  toRequire: 0,

  // Specifies dependency on other properties of the selected object.
  // Property is shown only when all conditions are matched.
  //
  // example: { display: ['flex', 'block'], position: ['absolute'] };
  //          in this case the property is only shown when display is
  //          of value 'flex' or 'block' AND position is 'absolute'
  requires: null,

  // Specifies dependency on properties of the parent of the selected object.
  // Property is shown only when all conditions are matched.
  requiresParent: null,

  parentTarget: null,
};
