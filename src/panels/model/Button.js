var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  defaults: {
    id: '',
    label: '',
    className: '',
    command: '',
    context: '',
    buttons: [],
    attributes: {},
    options: {},
    active: false,
    dragDrop: false,
    runDefaultCommand: true,
    stopDefaultCommand: false,
    disable: false
  },

  initialize(options) {
    if (this.get('buttons').length) {
      var Buttons = require('./Buttons');
      this.set('buttons', new Buttons(this.get('buttons')));
    }
  }
});
