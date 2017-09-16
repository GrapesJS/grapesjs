var PropertyView = require('./PropertyView');
var InputNumber = require('domain_abstract/ui/InputNumber');

module.exports = PropertyView.extend({

  initialize(options) {
    PropertyView.prototype.initialize.apply(this, arguments);
    const model = this.model;
    this.listenTo(model, 'change:unit', this.modelValueChanged);
    this.listenTo(model, 'el:change', this.elementUpdated);
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

  setValue(value) {
    this.input.setValue(value, {silent: 1});
  },

});
