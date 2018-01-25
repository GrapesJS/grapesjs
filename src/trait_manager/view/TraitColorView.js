let TraitView = require('./TraitView')
let InputColor = require('domain_abstract/ui/InputColor')

module.exports = TraitView.extend({
  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      let value = this.getModelValue()
      let inputColor = new InputColor({
        target: this.config.em,
        contClass: this.ppfx + 'field-color',
        model: this.model,
        ppfx: this.ppfx,
      })
      this.input = inputColor.render()
      this.$input = this.input.colorEl
      value = value || ''
      this.model.set('value', value).trigger('change:value')
      this.input.setValue(value)
    }
    return this.$input.get(0)
  },

  /**
   * Renders input
   * @private
   * */
  renderField() {
    if (!this.$input) {
      this.getInputEl()
      this.$el.append(this.input.el)
    }
  },
})
