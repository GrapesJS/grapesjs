var Backbone = require('backbone');
const Selector = require('./../model/Selector');
const inputProp = 'readOnly';

module.exports = Backbone.View.extend({
  template: _.template(`
  <span id="<%= pfx %>checkbox" class="fa" data-tag-status></span>
  <span id="<%= pfx %>tag-label">
      <input class="<%= ppfx %>no-app" value="<%= label %>" <%= inputProp %> data-tag-name>
  </span>
  <span id="<%= pfx %>close" data-tag-remove>&Cross;</span>`),

  events: {
    'click [data-tag-remove]': 'removeTag',
    'click [data-tag-status]': 'changeStatus',
    'dblclick [data-tag-name]': 'startEditTag',
    'keypress [data-tag-name]': 'updateInputLabel',
    'focusout [data-tag-name]': 'endEditTag',
  },

  initialize(o) {
    this.config = o.config || {};
    this.coll = o.coll || null;
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.inputProp = 'readonly';
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
    this.getInputEl()[inputProp] = false;
  },


  /**
   * End editing tag. If the class typed already exists the
   * old one will be restored otherwise will be changed
   * @private
   */
  endEditTag() {
    const model = this.model;
    const inputEl = this.getInputEl();
    const label = inputEl.value;
    const name = Selector.escapeName(label);
    const em = this.target;
    const sm = em && em.get('SelectorManager');
    inputEl[inputProp] = true;

    if (sm) {
      if (sm.get(name)) {
        inputEl.value = model.get('label');
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
    this.target.trigger('targetClassUpdated');
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
    const sel = em && em.get('selectedComponent');
    sel && sel.get & sel.get('classes').remove(model);
    coll && coll.remove(model);
    setTimeout(() => this.remove(), 0);
    em && em.trigger('targetClassRemoved');
  },

  /**
   * Update status of the checkbox
   * @private
   */
  updateStatus() {
    var chkOn = 'fa-check-square-o';
    var chkOff = 'fa-square-o';

    if(!this.$chk)
      this.$chk = this.$el.find('#' + this.pfx + 'checkbox');

    if(this.model.get('active')){
      this.$chk.removeClass(chkOff).addClass(chkOn);
      this.$el.removeClass('opac50');
    }else{
      this.$chk.removeClass(chkOn).addClass(chkOff);
      this.$el.addClass('opac50');
    }
  },

  /**
   * Update label's input
   * @private
   */
  updateInputLabel() {
    if(!this.$labelInput) {
      this.$labelInput = this.$el.find('input');
    }

    this.$labelInput.prop(this.inputProp, true);
    var size = this.$labelInput.val().length - 1;
    size = size < 1 ? 1 : size;
    this.$labelInput.attr('size', size);
  },


  render() {
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    this.$el.html( this.template({
      label: this.model.get('label'),
      pfx,
      ppfx,
      inputProp: this.inputProp,
    }));
    this.$el.attr('class', `${pfx}tag ${ppfx}three-bg`);
    this.updateStatus();
    this.updateInputLabel();
    return this;
  },

});
