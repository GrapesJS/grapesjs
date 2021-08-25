import { Model } from 'backbone';

export default class Modal extends Model {
  defaults() {
    return {
      title: '',
      content: '',
      open: false
    };
  }

  open() {
    this.set('open', true);
  }

  close() {
    this.set('open', false);
  }
}
