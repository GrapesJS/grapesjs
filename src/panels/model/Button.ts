import PanelManager from '..';
import { Model } from '../../abstract';
import EditorModel from '../../editor/model/Editor';
import Buttons from './Buttons';

export default class Button extends Model<PanelManager> {
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

  constructor(module: PanelManager, options: any) {
    super(module, options);
    if (this.get('buttons').length) {
      this.set('buttons', new Buttons(this.module, this.get('buttons')));
    }
  }
}
