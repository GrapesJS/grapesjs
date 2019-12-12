import Backbone from 'backbone';

const inputProp = 'contentEditable';

export default Backbone.View.extend({
  template() {
    const { pfx, model } = this;
    const label = model.get('label') || '';

    return `
      <span id="${pfx}checkbox" class="${pfx}tag-status" data-tag-status></span>
      <span id="${pfx}tag-label" data-tag-name>${label}</span>
      <span id="${pfx}close" class="${pfx}tag-close" data-tag-remove>
        <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
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
    const config = o.config || {};
    this.config = config;
    this.coll = o.coll || null;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.em = config.em;
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
    const { em } = this;
    const inputEl = this.getInputEl();
    inputEl[inputProp] = true;
    inputEl.focus();
    em && em.setEditing(1);
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
    const em = this.em;
    const sm = em && em.get('SelectorManager');
    inputEl[inputProp] = false;
    em && em.setEditing(0);

    if (sm) {
      const name = sm.escapeName(label);

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
    const { model } = this;
    model.set('active', !model.get('active'));
  },

  /**
   * Remove tag from the selected component
   * @param {Object} e
   * @private
   */
  removeTag() {
    const { em, model } = this;
    const sel = em && em.getSelected();
    if (!model.get('protected') && sel) sel.getSelectors().remove(model);
  },

  /**
   * Update status of the checkbox
   * @private
   */
  updateStatus() {
    const { model, $el } = this;
    const $chk = $el.find('[data-tag-status]');
    const iconOff =
      '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.11 0-2 .89-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5a2 2 0 0 0-2-2m0 2v14H5V5h14z"></path></svg>';
    const iconOn =
      '<svg viewBox="0 0 24 24"><path d="M19 19H5V5h10V3H5c-1.11 0-2 .89-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8h-2m-11.09-.92L6.5 11.5 11 16 21 6l-1.41-1.42L11 13.17l-3.09-3.09z"></path></svg>';

    if (model.get('active')) {
      $chk.html(iconOn);
      $el.removeClass('opac50');
    } else {
      $chk.html(iconOff);
      $el.addClass('opac50');
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
