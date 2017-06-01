var Backbone = require('backbone');
var PropertyView = require('./PropertyView');
var InputColor = require('domain_abstract/ui/InputColor');

module.exports = PropertyView.extend({

  renderTemplate() {},

  renderInput() {
    if (!this.input) {
      var inputColor = new InputColor({
        target: this.target,
        model: this.model,
        ppfx: this.ppfx
      });
      this.input = inputColor.render();
      this.$el.append(this.input.$el);
      this.$input = this.input.inputEl;
      this.$color = this.input.colorEl;
    }
    this.setValue(this.componentValue);
  },

  setValue(value) {
    this.input.setValue(value, {silent: 1});
  },

});
