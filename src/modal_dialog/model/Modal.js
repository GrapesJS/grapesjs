import Backbone from 'backbone';

export default class Modal extends Backbone.Model {
}
Modal.prototype.defaults = {
    title: '',
    content: '',
    open: false
  };
