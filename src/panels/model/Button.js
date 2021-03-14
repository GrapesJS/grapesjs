import Backbone from 'backbone';

export default class Button extends Backbone.Model {
    initialize(options) {
        if (this.get('buttons').length) {
          var Buttons = require('./Buttons').default;
          this.set('buttons', new Buttons(this.get('buttons')));
        }
    }
}
Button.prototype.defaults = {
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
  };
