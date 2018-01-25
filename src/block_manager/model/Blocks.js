let Backbone = require('backbone');
let Block = require('./Block');

module.exports = Backbone.Collection.extend({
  model: Block
});
