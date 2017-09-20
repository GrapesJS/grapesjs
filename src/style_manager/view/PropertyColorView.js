var Backbone = require('backbone');
var InputColor = require('domain_abstract/ui/InputColor');

module.exports = require('./PropertyIntegerView').extend({

  setValue(value, opts = {}) {
    opts = Object.assign({}, opts, {silent: 1});
    this.inputInst.setValue(value, opts);
  },

  onRender() {
    if (!this.input) {
      const inputColor = new InputColor({
        target: this.target,
        model: this.model,
        ppfx: this.ppfx
      });
      const input = inputColor.render();
      this.$el.append(input.$el);
      this.$input = input.inputEl;
      this.$color = input.colorEl;
      this.input = this.$input.get(0);
      this.inputInst = input;
    }
  },

});
