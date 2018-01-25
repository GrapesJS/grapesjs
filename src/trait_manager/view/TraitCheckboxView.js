let TraitView = require('./TraitView');

module.exports = TraitView.extend({
  initialize(o) {
    TraitView.prototype.initialize.apply(this, arguments);
    let iconCls = this.ppfx + 'chk-icon';
    this.tmpl =
      '<div class="' +
      this.fieldClass +
      '"><label class="' +
      this.inputhClass +
      '"><i class="' +
      iconCls +
      '"></i></label></div>';
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
    let first;
    if (!this.$input) first = 1;
    let el = TraitView.prototype.getInputEl.apply(this, args);
    if (first) {
      let md = this.model;
      let name = md.get('name');
      let target = this.target;
      if (md.get('changeProp')) {
        el.checked = target.get(name);
      } else {
        let attrs = target.get('attributes');
        el.checked = !!attrs[name];
      }
    }
    return el;
  }
});
