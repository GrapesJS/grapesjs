var TraitView = require('./TraitView');
var InputColor = require('domain_abstract/ui/InputColor');

module.exports = TraitView.extend({
  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      const model = this.model;
      const value = this.getModelValue();
      const inputColor = new InputColor({
        model,
        target: this.config.em,
        contClass: this.ppfx + 'field-color',
        ppfx: this.ppfx
      });
      const input = inputColor.render();
      this.$input = input.colorEl;
      input.setValue(value, { fromTarget: 1 });
      this.input = input;
    }

    return this.$input.get(0);
  },

  /**
   * Renders input
   * @private
   * */
  renderField() {
    if (!this.$input) {
      this.getInputEl();
      this.$el.append(this.input.el);
    }
  }
});
