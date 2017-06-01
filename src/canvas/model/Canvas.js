var Backbone = require('backbone');
var Frame = require('./Frame');

module.exports = Backbone.Model.extend({

  defaults :{
    frame: '',
    wrapper: '',
    rulers: false,
  },

  initialize(config) {
    var conf = this.conf || {};
    this.set('frame', new Frame(conf.frame));
  },

});
