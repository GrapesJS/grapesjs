module.exports = Backbone.Model.extend({
  defaults: {
    index: '',
    value: '',
    values: {},
    active: false,
    preview: false,
    properties: []
  },

  initialize() {
    const Properties = require('./Properties');
    const properties = this.get('properties');
    let value = this.get('value');
    this.set(
      'properties',
      properties instanceof Properties ? properties : new Properties(properties)
    );

    // If there is no value I'll try to get it from values
    // I need value setted to make preview working
    if (!value) {
      let val = '';
      let values = this.get('values');

      for (let prop in values) {
        val += ' ' + values[prop];
      }

      this.set('value', val.trim());
    }
  },

  getPropertyValue(property) {
    let result = '';
    this.get('properties').each(prop => {
      if (prop.get('property') == property) {
        result = prop.getFullValue();
      }
    });
    return result;
  },

  getFullValue() {
    let result = [];
    this.get('properties').each(prop => result.push(prop.getFullValue()));
    return result.join(' ');
  }
});
