import { Model } from '../../common';

export default class Button extends Model {
  defaults() {
    return {
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
      disable: false,
    };
  }

  initialize(options) {
    if (this.get('buttons').length) {
      var Buttons = require('./Buttons').default;
      this.set('buttons', new Buttons(this.get('buttons')));
    }
  }
}
