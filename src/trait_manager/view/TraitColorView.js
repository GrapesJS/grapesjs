var TraitView = require('./TraitView');
var InputColor = require('domain_abstract/ui/InputColor');

module.exports = TraitView.extend({
  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      var value = this.getModelValue();
      var inputNumber = new InputColor({
        contClass: this.ppfx + 'field-color',
        model: this.model,
        ppfx: this.ppfx
      });
      this.input = inputNumber.render();
      this.$input = this.input.colorEl;
      value = value || '';
      this.model.set('value', value).trigger('change:value');
    }
    return this.$input.get(0);
  },

  /**
   * Renders input
   * @private
   * */
  renderField() {
    if(!this.$input){
      this.getInputEl();
      this.$el.append(this.input.el);
    }
  },

});
