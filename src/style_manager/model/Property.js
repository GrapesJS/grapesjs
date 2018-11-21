import { isUndefined, isString } from 'underscore';

const Property = require('backbone').Model.extend(
  {
    defaults: {
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

      // If true, the property will be forced to be full width
      full: 0,

      // If true to the value will be added '!important'
      important: 0,

      // If true, will be hidden by default and will show up only for targets
      // which require this property (via `stylable-require`)
      // Use case:
      // you can add all SVG CSS properties with toRequire as true
      // and then require them on SVG Components
      toRequire: 0
    },

    initialize(props = {}, opts = {}) {
      const name = this.get('name');
      const prop = this.get('property');
      !this.get('id') && this.set('id', prop);

      if (!name) {
        this.set(
          'name',
          prop.charAt(0).toUpperCase() + prop.slice(1).replace(/-/g, ' ')
        );
      }

      Property.callInit(this, props, opts);
    },

    init() {},

    /**
     * Clear the value
     * @return {this}
     */
    clearValue(opts = {}) {
      this.set({ value: undefined }, opts);
      return this;
    },

    /**
     * Update value
     * @param {any} value
     * @param {Boolen} [complete=true] Indicates if it's a final state
     * @param {Object} [opts={}] Options
     */
    setValue(value, complete = 1, opts = {}) {
      const parsed = this.parseValue(value);
      this.set(parsed, { ...opts, avoidStore: 1 });

      // It's important to set an empty value, otherwise the
      // UndoManager won't see the change
      if (complete) {
        this.set('value', '', opts);
        this.set(parsed, opts);
      }
    },

    /**
     * Like `setValue` but, in addition, prevents the update of the input element
     * as the changes should come from the input itself.
     * This method is useful with the definition of custom properties
     * @param {any} value
     * @param {Boolen} [complete=true] Indicates if it's a final state
     * @param {Object} [opts={}] Options
     */
    setValueFromInput(value, complete, opts = {}) {
      this.setValue(value, complete, { ...opts, fromInput: 1 });
    },

    /**
     * Parse a raw value, generally fetched from the target, for this property
     * @param  {string} value Raw value string
     * @return {Object}
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
    },

    /**
     * Get the default value
     * @return {string}
     * @private
     */
    getDefaultValue() {
      return this.get('defaults');
    },

    /**
     * Get a complete value of the property.
     * This probably will replace the getValue when all
     * properties models will be splitted
     * @param {string} val Custom value to replace the one on the model
     * @return {string}
     * @private
     */
    getFullValue(val) {
      const fn = this.get('functionName');
      let value = isUndefined(val) ? this.get('value') : val;

      if (fn && !isUndefined(value)) {
        value = `${fn}(${value})`;
      }

      if (this.get('important')) {
        value = `${value} !important`;
      }

      return value || '';
    }
  },
  {
    callParentInit(property, ctx, props, opts = {}) {
      property.prototype.initialize.apply(ctx, [
        props,
        {
          ...opts,
          skipInit: 1
        }
      ]);
    },

    callInit(context, props, opts = {}) {
      !opts.skipInit && context.init(props, opts);
    }
  }
);

module.exports = Property;
