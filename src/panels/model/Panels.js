let Backbone = require('backbone')
let Panel = require('./Panel')

module.exports = Backbone.Collection.extend({
  model: Panel,
})
