import { Model } from '../../common';
import Buttons from './Buttons';

export default class Panel extends Model {
  defaults() {
    return {
      id: '',
      content: '',
      visible: true,
      buttons: [],
      attributes: {},
    };
  }

  initialize(options) {
    this.btn = this.get('buttons') || [];
    this.buttons = new Buttons(this.btn);
    this.set('buttons', this.buttons);
  }
}
