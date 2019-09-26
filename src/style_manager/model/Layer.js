import Backbone from 'backbone';
import Properties from './Properties';

export default Backbone.Model.extend({
  defaults: {
    index: '',
    value: '',
    values: {},
    active: false,
    preview: false,
    properties: []
  },

  initialize() {
    const properties = this.get('properties');
    var value = this.get('value');
    this.set(
      'properties',
      properties instanceof Properties ? properties : new Properties(properties)
    );
    this.get('properties').forEach(item => {
      const { collection } = this;
      item.parent = collection && collection.property;
    });

    // If there is no value I'll try to get it from values
    // I need value setted to make preview working
    if (!value) {
      var val = '';
      var values = this.get('values');

      for (var prop in values) {
        val += ' ' + values[prop];
      }

      this.set('value', val.trim());
    }
  },

  /**
   * Get property at some index
   * @param  {Number} index
   * @return {Object}
   */
  getPropertyAt(index) {
    return this.get('properties').at(index);
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
