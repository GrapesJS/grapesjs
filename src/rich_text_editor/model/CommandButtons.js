var Backbone = require('backbone');
var CommandButton = require('./CommandButton');

module.exports = Backbone.Collection.extend({
	model: CommandButton,
});
