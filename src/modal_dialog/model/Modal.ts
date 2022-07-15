import ModalManager from '..';
import { Model } from '../../abstract';

export default class Modal extends Model<ModalManager> {
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
