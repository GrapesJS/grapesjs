var TraitView = require('./TraitView');
var InputNumber = require('domain_abstract/ui/InputNumber');

module.exports = TraitView.extend({

  getValueForTarget() {
    var model = this.model;
    var value = model.get('value');
    var unit = model.get('unit');
    return value ? (value + unit) : '';
  },

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      var value = this.getModelValue();
      var inputNumber = new InputNumber({
        contClass: this.ppfx + 'field-int',
        model: this.model,
        ppfx: this.ppfx
      });
      this.input = inputNumber.render();
      this.$input = this.input.inputEl;
      this.$unit = this.input.unitEl;
      this.model.set('value', value);
      this.$input.val(value);
    }
    return this.$input.get(0);
  },

  /**
   * Renders input
   * @private
   * */
  renderField() {
    if(!this.$input){
      this.$el.append(this.tmpl);
      this.getInputEl();
      this.$el.find('.' + this.inputhClass).prepend(this.input.el);
    }
  },

});
