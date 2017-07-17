var Backbone = require('backbone');
var PropertyView = require('./PropertyView');
var InputNumber = require('domain_abstract/ui/InputNumber');

module.exports = PropertyView.extend({

  initialize(options) {
    PropertyView.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change:unit', this.valueChanged);
    this.listenTo(this.model, 'el:change', this.elementUpdated);
  },

  /**
   * Returns value from inputs
   * @return {string}
   */
  getValueForTarget() {
    var model = this.model;
    return model.get('value') + model.get('unit');
  },

  renderInput() {
    if (!this.input) {
      var inputNumber = new InputNumber({
        model: this.model,
        ppfx: this.ppfx
      });
      this.input = inputNumber.render();
      this.$el.append(this.input.$el);
      this.$input = this.input.inputEl;
      this.$unit = this.input.unitEl;
    }
    this.setValue(this.componentValue);
  },

  renderTemplate() {},

  setValue(value) {
    this.input.setValue(value, {silent: 1});
  },

});
