import Backbone from 'backbone';
import { isUndefined, isString } from 'underscore';
import { capitalize } from 'utils/mixins';

const Property = Backbone.Model.extend(
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
      requiresParent: null
    },

    initialize(props = {}, opts = {}) {
      const id = this.get('id') || '';
      const name = this.get('name') || '';
      !this.get('property') &&
        this.set('property', (name || id).replace(/ /g, '-'));
      const prop = this.get('property');
      !this.get('id') && this.set('id', prop);
      !name && this.set('name', capitalize(prop).replace(/-/g, ' '));
      Property.callInit(this, props, opts);
    },

    init() {},

    /**
     * Clear the value
     * @return {this}
     */
    clearValue(opts = {}) {
      this.set({ value: undefined, status: '' }, opts);
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
      const avoidStore = !complete;
      !avoidStore &&
        this.set({ value: undefined }, { avoidStore, silent: true });
      this.set(parsed, { avoidStore, ...opts });
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
     * Helper function to safely split a string of values.
     * Useful when style values are inside functions
     * eg:
     * -> input: 'value(1,2,4), 123, value(4,5)' -- default separator: ','
     * -> output: ['value(1,2,4)', '123', 'value(4,5)']
     * @param {String} values Values to split
     * @param {String} [separator] Separator
     */
    splitValues(values, separator = ',') {
      const res = [];
      const op = '(';
      const cl = ')';
      let curr = '';
      let acc = 0;

      (values || '').split('').forEach(str => {
        if (str == op) {
          acc++;
          curr = curr + op;
        } else if (str == cl && acc > 0) {
          acc--;
          curr = curr + cl;
        } else if (str === separator && acc == 0) {
          res.push(curr);
          curr = '';
        } else {
          curr = curr + str;
        }
      });

      curr !== '' && res.push(curr);

      return res.map(i => i.trim());
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
      const def = this.getDefaultValue();
      let value = isUndefined(val) ? this.get('value') : val;
      const hasValue = !isUndefined(value) && value !== '';

      if (value && def && value === def) {
        return def;
      }

      if (fn && hasValue) {
        const fnParameter =
          fn === 'url' ? `'${value.replace(/'/g, '')}'` : value;
        value = `${fn}(${fnParameter})`;
      }

      if (hasValue && this.get('important')) {
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

export default Property;
