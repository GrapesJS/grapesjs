var Backbone = require('backbone');
var Selector = require('./Selector');

module.exports = Backbone.Collection.extend({
  model: Selector,

  getStyleable() {
    return _.filter(this.models, item =>
      item.get('active') && !item.get('private'));
  },

  getValid() {
    return _.filter(this.models, item => !item.get('private'));
  }
});
