import PanelManager from '..';
import { Model } from '../../abstract';
import Buttons from './Buttons';

export default class Panel extends Model<PanelManager> {
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

  view?: any;

  constructor(module: PanelManager, options: any) {
    super(module, options);
    var btn = this.get('buttons') || [];
    this.buttons = new Buttons(module, btn);
  }
}
