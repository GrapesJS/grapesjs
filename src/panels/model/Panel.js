import Backbone from 'backbone';
import Buttons from './Buttons';

export default class Panel extends Backbone.Model {
    initialize(options) {
        this.btn = this.get('buttons') || [];
        this.buttons = new Buttons(this.btn);
        this.set('buttons', this.buttons);
    }
}
Panel.prototype.defaults = {
    id: '',
    content: '',
    visible: true,
    buttons: [],
    attributes: {}
  };
