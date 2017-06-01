var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  idAttribute: 'command',

  defaults: {
    command: '',
    type: '',
    title: '',
    class: '',
    options: [],
  },

  initialize() {
    var opts = this.get('options');
    if(opts.length)
      this.set('type', 'select');
  },

});
