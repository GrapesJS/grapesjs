import { isUndefined } from 'underscore';
import TraitView from './TraitView';

export default TraitView.extend({
  appendInput: 0,

  templateInput() {
    const { ppfx, clsField } = this;
    return `<label class="${clsField}" data-input>
    <i class="${ppfx}chk-icon"></i>
  </label>`;
  },

  /**
   * Fires when the input is changed
   * @private
   */
  onChange() {
    const value = this.getInputElem().checked;
    this.model.set('value', this.getCheckedValue(value));
  },

  getCheckedValue(checked) {
    let result = checked;
    const { valueTrue, valueFalse } = this.model.attributes;

    if (result && !isUndefined(valueTrue)) {
      result = valueTrue;
    }

    if (!result && !isUndefined(valueFalse)) {
      result = valueFalse;
    }

    return result;
  },

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl(...args) {
    const toInit = !this.$input;
    const el = TraitView.prototype.getInputEl.apply(this, args);

    if (toInit) {
      let checked, targetValue;
      const { model, target } = this;
      const { valueTrue, valueFalse } = model.attributes;
      const name = model.get('name');

      if (model.get('changeProp')) {
        checked = target.get(name);
        targetValue = checked;
      } else {
        targetValue = target.get('attributes')[name];
        checked = targetValue || targetValue === '' ? !0 : !1;
      }

      if (!isUndefined(valueFalse) && targetValue === valueFalse) {
        checked = !1;
      }

      el.checked = checked;
    }

    return el;
  }
});
