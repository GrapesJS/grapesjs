let Backbone = require('backbone')
let Frame = require('./Frame')

module.exports = Backbone.Model.extend({
  defaults: {
    frame: '',
    wrapper: '',
    rulers: false,
  },

  initialize(config) {
    let conf = this.conf || {}
    this.set('frame', new Frame(conf.frame))
  },
})
