import Backbone from 'backbone';

export default class ToolbarButton extends Backbone.Model {
  defaults = {
    command: '',
    attributes: {},
  };
}
