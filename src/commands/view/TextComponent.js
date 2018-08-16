import _ from 'underscore';
import Backbone from 'backbone';
var CreateComponent = require('./CreateComponent');

module.exports = _.extend({}, CreateComponent, {
  /**
   * This event is triggered at the beginning of a draw operation
   * @param   {Object}   component  Object component before creation
   * @private
   * */
  beforeDraw(component) {
    component.type = 'text';
    if (!component.style) component.style = {};
    component.style.padding = '10px';
  },

  /**
   * This event is triggered at the end of a draw operation
   * @param   {Object}  model  Component model created
   * @private
   * */
  afterDraw(model) {
    if (!model || !model.set) return;
    model.trigger('focus');
    if (this.sender) this.sender.set('active', false);
  }
});
