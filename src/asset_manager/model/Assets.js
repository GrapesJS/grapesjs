import TypeableCollection from 'domain_abstract/model/TypeableCollection';

module.exports = require('backbone').Collection.extend(TypeableCollection).extend({
  types: [{
      id: 'image',
      model: require('./AssetImage'),
      view: require('./../view/AssetImageView'),
      isType(value) {
        if (typeof value == 'string') {
          return {
            type: 'image',
            src: value,
          }
        }
        return value;
      }
  }]
});
