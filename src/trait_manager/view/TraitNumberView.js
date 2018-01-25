let TraitView = require('./TraitView');
let InputNumber = require('domain_abstract/ui/InputNumber');

module.exports = TraitView.extend({
  getValueForTarget() {
    let model = this.model;
    let value = model.get('value');
    let unit = model.get('unit');
    return value ? value + unit : '';
  },

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      let value = this.getModelValue();
      let inputNumber = new InputNumber({
        contClass: this.ppfx + 'field-int',
        model: this.model,
        ppfx: this.ppfx
      });
      this.input = inputNumber.render();
      this.$input = this.input.inputEl;
      this.$unit = this.input.unitEl;
      this.model.set('value', value);
      this.$input.val(value);
    }
    return this.$input.get(0);
  },

  /**
   * Renders input
   * @private
   * */
  renderField() {
    if (!this.$input) {
      this.$el.append(this.tmpl);
      this.getInputEl();
      this.$el.find('.' + this.inputhClass).prepend(this.input.el);
    }
  }
});
