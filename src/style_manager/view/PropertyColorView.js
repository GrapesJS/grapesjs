var Backbone = require('backbone');
var InputColor = require('domain_abstract/ui/InputColor');

module.exports = require('./PropertyIntegerView').extend({

  init() {
    this.className += ` ${this.pfx}file`;
  },

  setValue(value) {
    this.input.setValue(value, {silent: 1});
  },

  onRender() {
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
  },

});
