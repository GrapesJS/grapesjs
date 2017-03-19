define(['./TraitView', 'Abstract/ui/InputNumber'],
  function (TraitView, InputNumber) {

  return TraitView.extend({

    /**
     * Returns input element
     * @return {HTMLElement}
     * @private
     */
    getInputEl: function() {
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
    renderField: function() {
      if(!this.$input){
        this.$el.append(this.tmpl);
        this.getInputEl();
        this.$el.find('.' + this.inputhClass).prepend(this.input.el);
      }
    },

  });
});
