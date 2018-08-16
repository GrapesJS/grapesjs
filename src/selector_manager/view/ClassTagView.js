const Selector = require('./../model/Selector');
const inputProp = 'contentEditable';

module.exports = require('backbone').View.extend({
  template() {
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    const label = this.model.get('label') || '';
    return `
      <span id="${pfx}checkbox" class="fa" data-tag-status></span>
      <span id="${pfx}tag-label" data-tag-name>${label}</span>
      <span id="${pfx}close" data-tag-remove>
        &Cross;
      </span>
    `;
  },

  events: {
    'click [data-tag-remove]': 'removeTag',
    'click [data-tag-status]': 'changeStatus',
    'dblclick [data-tag-name]': 'startEditTag',
    'focusout [data-tag-name]': 'endEditTag'
  },

  initialize(o) {
    this.config = o.config || {};
    this.coll = o.coll || null;
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.target = this.config.em;
    this.listenTo(this.model, 'change:active', this.updateStatus);
  },

  /**
   * Returns the element which containes the anme of the tag
   * @return {HTMLElement}
   */
  getInputEl() {
    if (!this.inputEl) {
      this.inputEl = this.el.querySelector('[data-tag-name]');
    }

    return this.inputEl;
  },

  /**
   * Start editing tag
   * @private
   */
  startEditTag() {
    const inputEl = this.getInputEl();
    inputEl[inputProp] = true;
    inputEl.focus();
  },

  /**
   * End editing tag. If the class typed already exists the
   * old one will be restored otherwise will be changed
   * @private
   */
  endEditTag() {
    const model = this.model;
    const inputEl = this.getInputEl();
    const label = inputEl.textContent;
    const name = Selector.escapeName(label);
    const em = this.target;
    const sm = em && em.get('SelectorManager');
    inputEl[inputProp] = false;

    if (sm) {
      if (sm.get(name)) {
        inputEl.innerText = model.get('label');
      } else {
        model.set({ name, label });
      }
    }
  },

  /**
   * Update status of the tag
   * @private
   */
  changeStatus() {
    this.model.set('active', !this.model.get('active'));
  },

  /**
   * Remove tag from the selected component
   * @param {Object} e
   * @private
   */
  removeTag(e) {
    const em = this.target;
    const model = this.model;
    const coll = this.coll;
    const el = this.el;
    const sel = em && em.getSelected();
    sel && sel.get & sel.get('classes').remove(model);
    coll && coll.remove(model);
    setTimeout(() => this.remove(), 0);
  },

  /**
   * Update status of the checkbox
   * @private
   */
  updateStatus() {
    var chkOn = 'fa-check-square-o';
    var chkOff = 'fa-square-o';

    if (!this.$chk) this.$chk = this.$el.find('#' + this.pfx + 'checkbox');

    if (this.model.get('active')) {
      this.$chk.removeClass(chkOff).addClass(chkOn);
      this.$el.removeClass('opac50');
    } else {
      this.$chk.removeClass(chkOn).addClass(chkOff);
      this.$el.addClass('opac50');
    }
  },

  render() {
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    this.$el.html(this.template());
    this.$el.attr('class', `${pfx}tag ${ppfx}three-bg`);
    this.updateStatus();
    return this;
  }
});
