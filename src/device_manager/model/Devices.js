import Backbone from 'backbone';
var Device = require('./Device');

module.exports = Backbone.Collection.extend({
  model: Device
});
