import { isString, isUndefined } from 'underscore';
import { $ } from '../../common';
import { setStyleText } from '../../utils/dom';
import TraitView from './TraitView';

export default class TraitSelectView extends TraitView {
  constructor(o = {}) {
    super(o);
    this.listenTo(this.model, 'change:options', this.rerender);
  }

  templateInput() {
    const { ppfx, clsField } = this;
    return `<div class="${clsField}">
      <div data-input></div>
      <div class="${ppfx}sel-arrow">
        <div class="${ppfx}d-s-arrow"></div>
      </div>
    </div>`;
  }

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      const { model, em } = this;
      const propName = model.get('name');
      const opts = model.get('options') || [];
      const values: string[] = [];
      let input = '<select>';

      const styles: string[] = [];

      opts.forEach((el) => {
        let name, value, style;

        if (isString(el)) {
          name = el;
          value = el;
        } else {
          name = el.name || el.label || el.value;
          value = `${isUndefined(el.value) ? el.id : el.value}`.replace(/"/g, '&quot;');
          style = el.style as string;
        }
        const resultName = em.t(`traitManager.traits.options.${propName}.${value}`) || name;
        styles.push(style || '');
        input += `<option value="${value}">${resultName}</option>`;
        values.push(value);
      });

      input += '</select>';
      this.$input = $(input);
      // Option styles are applied through the CSSOM, a `style` attribute would
      // be blocked by a strict `style-src-attr` policy
      const optionEls = this.$input!.get(0)!.querySelectorAll('option');
      styles.forEach((style, i) => style && setStyleText(optionEls[i] as HTMLElement, style));
      const val = model.getTargetValue();
      const valResult = values.indexOf(val) >= 0 ? val : model.get('default');
      !isUndefined(valResult) && this.$input!.val(valResult);
    }

    return this.$input!.get(0);
  }
}
