import { isUndefined } from 'underscore';
import TraitView from './TraitView';

export default class TraitCheckboxView extends TraitView {
  appendInput = false;

  templateInput() {
    const { ppfx, clsField } = this;
    return `<label class="${clsField}" data-input>
    <i class="${ppfx}chk-icon"></i>
  </label>`;
  }

  /**
   * Fires when the input is changed
   * @private
   */
  onChange() {
    this.model.set('value', this.getInputElem().checked);
  }

  setInputValue(value: any) {
    const el = this.getInputElem();
    el && (el.checked = !!value);
  }

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl(...args: any) {
    const toInit = !this.$input;
    const el = TraitView.prototype.getInputEl.apply(this, args);

    if (toInit) {
      let checked, targetValue;
      const { model, target } = this;
      const { valueFalse } = model.attributes;
      const name = model.getName();

      if (model.get('changeProp')) {
        checked = target.get(name);
        targetValue = checked;
      } else {
        targetValue = target.get('attributes')![name];
        checked = targetValue || targetValue === '' ? !0 : !1;
      }

      if (!isUndefined(valueFalse) && targetValue === valueFalse) {
        checked = !1;
      }

      el!.checked = checked;
    }

    return el;
  }
}
