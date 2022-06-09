import Backbone from 'backbone';

export default class ToolbarButton extends Backbone.Model {
  defaults() {
    return {
      command: '',
      attributes: {},
    };
  }
}
