const Property = require('./Property');

module.exports = Property.extend({

  defaults: Object.assign({}, Property.prototype.defaults, {
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
  }),

  init() {
    const properties = this.get('properties') || [];
    const Properties = require('./Properties');
    this.set('properties', new Properties(properties));
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
    properties.each((prop, index) => value += `${prop.getDefaultValue()} `);
    return value.trim();
  },

  getFullValue() {
    if (this.get('detached')) {
      return '';
    }

    let result = '';
    this.get('properties').each(prop => result += `${prop.getFullValue()} `);
    return result.trim();
  },

});
