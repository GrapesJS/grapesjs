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
   * Handled when the view is changed
   */
  handleChange(e) {
    e.stopPropagation();
    this.setValue(this.getInputEl().value);
  },

  /**
   * Set value to the model
   * @param {string} value
   * @param {Object} opts
   */
  setValue(value, opts) {
    var opt = opts || {};
    var model = this.model;
    model.set({
      value: value || model.get('defaults')
    }, opt);

    // Generally I get silent when I need to reflect data to view without
    // reupdating the target
    if(opt.silent) {
      this.handleModelChange(model, value, opt);
    }
  },

  /**
   * Updates the view when the model is changed
   * */
  handleModelChange(model, value, opts) {
    this.getInputEl().value = this.model.get('value');
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
