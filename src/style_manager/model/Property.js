module.exports = require('backbone').Model.extend({

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

    // If true, will be hidden by default and will show up only for targets
    // which require this property (via `stylable-require`)
    // Use case:
    // you can add all SVG CSS properties with toRequire as true
    // and then require them on SVG Components
    toRequire: 0,
  },


  initialize(opt) {
    var o = opt || {};
    var name = this.get('name');
    var prop = this.get('property');

    if (!name) {
      this.set('name', prop.charAt(0).toUpperCase() + prop.slice(1).replace(/-/g,' '));
    }

    const init = this.init && this.init.bind(this);
    init && init();
  },


  /**
   * Update value
   * @param {any} value
   * @param {Boolen} [complete=true] Indicates if it's a final state
   * @param {Object} [opts={}] Options
   */
  setValue(value, complete = 1, opts = {}) {
    const parsed = this.parseValue(value);
    this.set(parsed, { ...opts, avoidStore: 1});

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
    this.setValue(value, complete, {...opts, fromInput: 1});
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
  parseValue(value) {
    const result = { value };

    if (!this.get('functionName')) {
      return result;
    }

    const args = [];
    let valueStr = `${value}`;
    let start = valueStr.indexOf('(') + 1;
    let end = valueStr.lastIndexOf(')');
    args.push(start);

    // Will try even if the last closing parentheses is not found
    if (end >= 0) {
      args.push(end);
    }

    result.value = String.prototype.substring.apply(valueStr, args);
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
    let value = val || this.get('value');

    if (fn) {
      value = `${fn}(${value})`;
    }

    return value;
  },

});
