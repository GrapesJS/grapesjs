import ModalModule from '..';
import { ModuleModel } from '../../abstract';

export default class Modal extends ModuleModel<ModalModule> {
  defaults() {
    return {
      title: '',
      content: '',
      attributes: {},
      open: false,
    };
  }

  open() {
    this.set('open', true);
  }

  close() {
    this.set('open', false);
  }
}
