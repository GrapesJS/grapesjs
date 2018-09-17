var TraitView = require('./TraitView');

module.exports = TraitView.extend({
  initialize(o) {
    TraitView.prototype.initialize.apply(this, arguments);
    const { ppfx, fieldClass, inputhClass } = this;
    this.tmpl = `<div class="${fieldClass}">
        <label class="${inputhClass}">
          <i class="${ppfx}chk-icon"></i>
        </label>
      </div>`;
  },

  /**
   * Fires when the input is changed
   * @private
   */
  onChange() {
    this.model.set('value', this.getInputEl().checked);
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
      let checked;
      const { model, target } = this;
      const name = model.get('name');

      if (model.get('changeProp')) {
        checked = target.get(name);
      } else {
        checked = target.get('attributes')[name];
        checked = checked || checked === '' ? !0 : !1;
      }

      el.checked = checked;
    }

    return el;
  }
});
