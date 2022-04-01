import { isUndefined } from 'underscore';
import InputNumber from '../../domain_abstract/ui/InputNumber';
import TraitView from './TraitView';

export default class TraitNumberView extends TraitView {
  getValueForTarget() {
    const { model } = this;
    const { value, unit } = model.attributes;
    return !isUndefined(value) && value !== '' ? value + unit : model.get('default');
  }

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.input) {
      const { ppfx, model } = this;
      const value = this.getModelValue();
      const inputNumber = new InputNumber({
        contClass: `${ppfx}field-int`,
        type: 'number',
        model: model,
        ppfx,
      });
      this.input = inputNumber.render();
      this.$input = this.input.inputEl;
      this.$unit = this.input.unitEl;
      model.set('value', value, { fromTarget: 1 });
      this.$input.val(value);
      this.input = inputNumber.el;
    }
    return this.input;
  }
}
