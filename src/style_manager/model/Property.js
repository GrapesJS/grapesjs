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
    this.set('value', value, { ...opts, avoidStore: 1});

    // It's important to set an empty value, otherwise the
    // UndoManager won't see the change
    if (complete) {
      this.set('value', '', opts);
      this.set('value', value, opts);
    }
  },


  /**
   * Parse a raw value, generally fetched from the target, for this property
   * @param  {string} value
   * @return {string}
   */
  parseValue(value) {
    if (!this.get('functionName')) {
      return value;
    }

    const args = [];
    let valueStr = value + '';
    let start = valueStr.indexOf('(') + 1;
    let end = valueStr.lastIndexOf(')');
    args.push(start);

    // Will try even if the last closing parentheses is not found
    if (end >= 0) {
      args.push(end);
    }

    return String.prototype.substring.apply(valueStr, args);
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
