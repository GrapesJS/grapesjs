import Backbone from 'backbone';

export default class ToolbarButton extends Backbone.Model {
}
ToolbarButton.prototype.defaults = {
    command: '',
    attributes: {}
  };
