import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    id: '',
    label: '',
    tagName: 'span',
    className: '',
    command: '',
    context: '',
    buttons: [],
    attributes: {},
    options: {},
    active: false,
    dragDrop: false,
    togglable: true,
    runDefaultCommand: true,
    stopDefaultCommand: false,
    disable: false
  },

  initialize(options) {
    if (this.get('buttons').length) {
      var Buttons = require('./Buttons').default;
      this.set('buttons', new Buttons(this.get('buttons')));
    }
  }
});
