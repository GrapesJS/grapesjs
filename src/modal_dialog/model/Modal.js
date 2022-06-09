import { Model } from '../../common';

export default class Modal extends Model {
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
