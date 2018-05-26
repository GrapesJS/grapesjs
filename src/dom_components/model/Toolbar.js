const Backbone = require('backbone');
const ToolbarButton = require('./ToolbarButton');

module.exports = Backbone.Collection.extend({ model: ToolbarButton });
