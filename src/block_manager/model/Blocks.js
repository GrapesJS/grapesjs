import Backbone from 'backbone';
var Block = require('./Block');

export default Backbone.Collection.extend({
  model: Block
});
