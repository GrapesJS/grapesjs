var Backbone = require('backbone');
var Property = require('./Property');

module.exports = Backbone.Collection.extend({
  model: Property,
});
