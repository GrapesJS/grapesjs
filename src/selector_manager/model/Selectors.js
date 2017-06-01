var Backbone = require('backbone');
var Selector = require('./Selector');

module.exports = Backbone.Collection.extend({
  model: Selector,
});
