let Backbone = require('backbone')
let Device = require('./Device')

module.exports = Backbone.Collection.extend({
  model: Device,
})
