var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  events: {
    'change': 'handleChange',
  },

  template: _.template(`<span class='<%= holderClass %>'></span>`),

  initialize(opts) {
    var opt = opts || {};
    var ppfx = opt.ppfx || '';
    this.target = opt.target || {};
    this.inputClass = ppfx + 'field';
    this.inputHolderClass = ppfx + 'input-holder';
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
      this.handleModelChange();
    }
  },

  /**
   * Updates the view when the model is changed
   * */
  handleModelChange() {
    this.getInputEl().value = this.model.get('value');
  },

  /**
   * Get the input element
   * @return {HTMLElement}
   */
  getInputEl() {
    if(!this.inputEl) {
      this.inputEl = $('<input>', {
        type: 'text',
        class: this.inputCls,
        placeholder: this.model.get('defaults')
      });
    }
    return this.inputEl.get(0);
  },

  render() {
    var el = this.$el;
    el.addClass(this.inputClass);
    el.html(this.template({
      holderClass: this.inputHolderClass,
      ppfx: this.ppfx
    }));
    el.find('.'+ this.inputHolderClass).html(this.getInputEl());
    return this;
  }

});
