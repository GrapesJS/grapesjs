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

  get className(): string {
    return this.get('className');
  }

  get command(): string {
    return this.get('command');
  }

  get active(): boolean {
    return this.get('active');
  }
  set active(isActive: boolean) {
    this.set('active', isActive);
  }

  get togglable(): boolean {
    return this.get('togglable');
  }

  get runDefaultCommand(): boolean {
    return this.get('runDefaultCommand');
  }
  get stopDefaultCommand(): boolean {
    return this.get('stopDefaultCommand');
  }
  get disable(): boolean {
    return this.get('disable');
  }

  constructor(module: PanelManager, options: any) {
    super(module, options);
    if (this.get('buttons').length) {
      this.set('buttons', new Buttons(this.module, this.get('buttons')));
    }
  }
}
