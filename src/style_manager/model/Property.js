var Backbone = require('backbone');
var Layers = require('./Layers');

module.exports = Backbone.Model.extend({

  defaults: {
    name: '',
    property: '',
    type: '',
    units: [], // int
    unit: '', // int
    defaults: '',
    info: '',
    value: '',
    icon: '',
    preview: false, // stack
    detached: false, // composite
    visible: true,
    functionName: '',
    status: '',
    properties: [], // composite
    layers: [], // stack
    list: [], // select/radio
    fixedValues: ['initial', 'inherit'],
  },

  initialize(opt) {
    var o = opt || {};
    var type = this.get('type');
    var name = this.get('name');
    var prop = this.get('property');
    var props = this.get('properties');

    if(!name)
      this.set('name', prop.charAt(0).toUpperCase() + prop.slice(1).replace(/-/g,' '));

    if(props.length){
      var Properties = require('./Properties');
      this.set('properties', new Properties(props));
    }

    switch(type){
      case 'stack':
        this.set('layers', new Layers());
        break;
    }
  },

  /**
   * Return value
   * @return {string} Value
   * @private
   */
  getValue() {
    var result = '';
    var type = this.get('type');

    switch(type){
      case 'integer':
        result = this.get('value') + this.get('unit');
        break;
      default:
        result = this.get('value');
        break;
    }

    return result;
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

    let valueStr = value + '';
    let start = valueStr.indexOf('(') + 1;
    let end = valueStr.lastIndexOf(')');
    return valueStr.substring(start, end);
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
