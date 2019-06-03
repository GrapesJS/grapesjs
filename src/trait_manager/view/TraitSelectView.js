import { isString, isUndefined } from 'underscore';
const TraitView = require('./TraitView');
const $ = require('backbone').$;

module.exports = TraitView.extend({
  initialize(o) {
    TraitView.prototype.initialize.apply(this, arguments);
    const { ppfx, inputhClass, fieldClass, model } = this;
    this.listenTo(model, 'change:options', this.render);
    this.tmpl = `<div class="${fieldClass}">
      <div class="${inputhClass}"></div>
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
          name = el.name ? el.name : el.value;
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
      this.input = input;
      this.$input = $(input);
      let val = model.getTargetValue() || model.get('value');
      !isUndefined(val) && this.$input.val(val);
    }

    return this.$input.get(0);
  }
});
