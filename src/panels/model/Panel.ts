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

  get buttons() {
    return this.get('buttons');
  }

  private set buttons(buttons: Buttons) {
    this.set('buttons', buttons);
  }

  constructor(options: any) {
    super(options);
    var btn = this.get('buttons') || [];
    this.buttons = new Buttons(btn);
    this.set('buttons', this.buttons);
  }
}
