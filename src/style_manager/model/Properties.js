/*
var Backbone = require('backbone');
var Property = require('./Property');

module.exports = Backbone.Collection.extend({
  model: Property,
});
*/
import TypeableCollection from 'domain_abstract/model/TypeableCollection';

module.exports = require('backbone').Collection.extend(TypeableCollection).extend({
  types: [
    {
      id: 'select',
      model: require('./PropertyRadio'),
      view: require('./../view/PropertySelectView'),
      isType(value) {
        if (value && value.type == 'select') {
          return value;
        }
      }
    },{
      id: 'radio',
      model: require('./PropertyRadio'),
      view: require('./../view/PropertyRadioView'),
      isType(value) {
        if (value && value.type == 'radio') {
          return value;
        }
      }
    },{
      id: 'integer',
      model: require('./PropertyInteger'),
      view: require('./../view/PropertyIntegerView'),
      isType(value) {
        if (value && value.type == 'integer') {
          return value;
        }
      }
    },{
      id: 'base',
      model: require('./Property'),
      view: require('./../view/PropertyView'),
      isType(value) {
        return 1;
      }
    }
  ]
});
