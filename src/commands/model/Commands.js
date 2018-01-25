let Backbone = require('backbone')
let Command = require('./Command')

module.exports = Backbone.Collection.extend({
  model: Command,
})
