var Backbone = require('backbone');
var Sector = require('./Sector');

module.exports = Backbone.Collection.extend({
	model: Sector,
});
