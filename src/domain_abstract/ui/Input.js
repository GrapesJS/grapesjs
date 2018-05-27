const Backbone = require('backbone');
const $ = Backbone.$;

module.exports = Backbone.View.extend({
  events: {
    change: 'handleChange'
  },

  template() {
    return `<span class="${this.holderClass()}"></span>`;
  },

  inputClass() {
    return `${this.ppfx}field`;
  },

  holderClass() {
    return `${this.ppfx}input-holder`;
  },

  initialize(opts = {}) {
    const ppfx = opts.ppfx || '';
    this.opts = opts;
    this.ppfx = ppfx;
    this.em = opts.target || {};
    this.listenTo(this.model, 'change:value', this.handleModelChange);
  },

  /**
   * Fired when the element of the property is updated
   */
  elementUpdated() {
    this.model.trigger('el:change');
  },

  /**
   * Set value to the input element
   * @param {string} value
   */
  setValue(value) {
    const model = this.model;
    let val = value || model.get('defaults');
    const input = this.getInputEl();
    input && (input.value = val);
  },

  /**
   * Updates the view when the model is changed
   * */
  handleModelChange(model, value, opts) {
    this.setValue(value, opts);
  },

  /**
   * Handled when the view is changed
   */
  handleChange(e) {
    e.stopPropagation();
    const value = this.getInputEl().value;
    this.model.set({ value }, { fromInput: 1 });
    this.elementUpdated();
  },

  /**
   * Get the input element
   * @return {HTMLElement}
   */
  getInputEl() {
    if (!this.inputEl) {
      const plh = this.model.get('defaults') || '';
      this.inputEl = $(`<input type="text" placeholder="${plh}">`);
    }

    return this.inputEl.get(0);
  },

  render() {
    const el = this.$el;
    el.addClass(this.inputClass());
    el.html(this.template());
    el.find(`.${this.holderClass()}`).append(this.getInputEl());
    return this;
  }
});
