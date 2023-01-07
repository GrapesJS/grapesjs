import { isUndefined } from 'underscore';
import InputNumber from '../../domain_abstract/ui/InputNumber';
import TraitView from './TraitView';

export default class TraitNumberView extends TraitView {
  $unit?: HTMLElement;
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
      inputNumber.render();
      this.$input = inputNumber.inputEl as JQuery<HTMLInputElement>;
      this.$unit = inputNumber.unitEl as HTMLElement;
      // @ts-ignore
      model.set('value', value, { fromTarget: true });
      this.$input.val(value);
      this.input = inputNumber.el as HTMLInputElement;
    }
    return this.input;
  }
}
