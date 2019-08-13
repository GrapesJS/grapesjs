import Backbone from 'backbone';
import Buttons from './Buttons';

export default Backbone.Model.extend({
  defaults: {
    id: '',
    content: '',
    visible: true,
    buttons: [],
    attributes: {}
  },

  initialize(options) {
    this.btn = this.get('buttons') || [];
    this.buttons = new Buttons(this.btn);
    this.set('buttons', this.buttons);
  }
});
