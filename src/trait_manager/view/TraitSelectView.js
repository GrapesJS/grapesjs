import Backbone from 'backbone';
import { isString, isUndefined } from 'underscore';
import TraitView from './TraitView';

const $ = Backbone.$;

export default TraitView.extend({
  init() {
    this.listenTo(this.model, 'change:options', this.rerender);
  },

  templateInput() {
    const { ppfx, clsField } = this;
    return `<div class="${clsField}">
      <div data-input></div>
      <div class="${ppfx}sel-arrow">
        <div class="${ppfx}d-s-arrow"></div>
      </div>
    </div>`;
  },

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      const { model } = this;
      const opts = model.get('options') || [];
      let input = '<select>';

      opts.forEach(el => {
        let attrs = '';
        let name, value, style;

        if (isString(el)) {
          name = el;
          value = el;
        } else {
          name = el.name || el.label || el.value;
          value = `${isUndefined(el.value) ? el.id : el.value}`.replace(
            /"/g,
            '&quot;'
          );
          style = el.style ? el.style.replace(/"/g, '&quot;') : '';
          attrs += style ? ` style="${style}"` : '';
        }

        input += `<option value="${value}"${attrs}>${name}</option>`;
      });

      input += '</select>';
      this.$input = $(input);
      let val = model.getTargetValue() || model.get('value');
      !isUndefined(val) && this.$input.val(val);
    }

    return this.$input.get(0);
  }
});
