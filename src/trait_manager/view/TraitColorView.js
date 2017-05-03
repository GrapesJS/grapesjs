define(['./TraitView', 'Abstract/ui/InputColor'],
  function (TraitView, InputColor) {

  return TraitView.extend({
    /**
     * Returns input element
     * @return {HTMLElement}
     * @private
     */
    getInputEl: function() {
      if (!this.$input) {
        var value = this.getModelValue();
        var inputNumber = new InputColor({
          contClass: this.ppfx + 'field-color',
          model: this.model,
          ppfx: this.ppfx
        });
        this.input = inputNumber.render();
        this.$input = this.input.colorEl;
        this.model.set('value', value);
      }
      return this.$input.get(0);
    },

    /**
     * Renders input
     * @private
     * */
    renderField: function() {
      if(!this.$input){
        this.getInputEl();
        this.$el.append(this.input.el);
      }
    },

  });
});
