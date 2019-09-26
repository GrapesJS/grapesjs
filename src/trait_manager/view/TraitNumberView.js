import TraitView from './TraitView';
import InputNumber from 'domain_abstract/ui/InputNumber';

export default TraitView.extend({
  getValueForTarget() {
    const { model } = this;
    const { value, unit } = model.attributes;
    return value ? value + unit : '';
  },

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.input) {
      var value = this.getModelValue();
      var inputNumber = new InputNumber({
        contClass: this.ppfx + 'field-int',
        model: this.model,
        ppfx: this.ppfx
      });
      this.input = inputNumber.render();
      this.$input = this.input.inputEl;
      this.$unit = this.input.unitEl;
      this.model.set('value', value);
      this.$input.val(value);
      this.input = inputNumber.el;
    }
    return this.input;
  }
});
