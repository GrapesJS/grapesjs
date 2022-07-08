import { Model } from '../../common';
import Buttons from './Buttons';

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

  constructor(options: any) {
    super(options);
    if (this.get('buttons').length) {
      this.set('buttons', new Buttons(this.get('buttons')));
    }
  }
}
