var Backbone = require('backbone');
var Layers = require('./Layers');

module.exports = Backbone.Model.extend({

  defaults: {
    name: '',
    property: '',
    type: '',
    units: [],
    unit: '',
    defaults: '',
    info: '',
    value: '',
    icon: '',
    preview: false,
    detached: false,
    visible: true,
    functionName: '',
    properties: [],
    layers: [],
    list: [],
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

});
