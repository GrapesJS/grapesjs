var Backbone = require('backbone');
var Command = require('./Command');

module.exports = Backbone.Collection.extend({

  model: Command,

});
