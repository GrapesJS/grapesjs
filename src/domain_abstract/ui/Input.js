const $ = Backbone.$;

module.exports = Backbone.View.extend({

  events: {
    'change': 'handleChange',
  },

  template() {
    const holderClass = this.holderClass;
    return `<span class="${holderClass}"></span>`;
  },

  initialize(opts = {}) {
    const ppfx = opts.ppfx || '';
    this.target = opts.target || {};
    this.inputClass = ppfx + 'field';
    this.inputHolderClass = ppfx + 'input-holder';
    this.holderClass = `${ppfx}input-holder`;
    this.ppfx = ppfx;
    this.listenTo(this.model, 'change:value', this.handleModelChange);
  },

  /**
   * Fired when the element of the property is updated
   */
  elementUpdated() {
    this.model.trigger('el:change');
  },

  /**
   * Handled when the view is changed
   */
  handleChange(e) {
    e.stopPropagation();
    this.model.set('value', this.getInputEl().value);
    this.elementUpdated();
  },

  /**
   * Set value to the model
   * @param {string} value
   * @param {Object} opts
   */
  setValue(value, opts = {}) {
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
   * Get the input element
   * @return {HTMLElement}
   */
  getInputEl() {
    if(!this.inputEl) {
      const plh = this.model.get('defaults');
      const cls = this.inputCls;
      this.inputEl = $(`<input type="text" class="${cls}" placeholder="${plh}">`);
    }
    return this.inputEl.get(0);
  },

  render() {
    const el = this.$el;
    const ppfx = this.ppfx;
    const holderClass = this.holderClass;
    el.addClass(this.inputClass);
    el.html(this.template());
    el.find(`.${holderClass}`).append(this.getInputEl());
    return this;
  }

});
