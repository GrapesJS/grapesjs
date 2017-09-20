const InputNumber = require('domain_abstract/ui/InputNumber');

module.exports = require('./PropertyView').extend({

  template(model) {
    const pfx = this.pfx;
    return `
      <div class="${pfx}label">
        ${this.templateLabel(model)}
      </div>
    `;
  },

  init() {
    const model = this.model;
    this.listenTo(model, 'change:unit', this.modelValueChanged);
    this.listenTo(model, 'el:change', this.elementUpdated);
  },

  setValue(value) {
    this.inputInst.setValue(value, {silent: 1});
  },

  onRender() {
    if (!this.input) {
      const inputNumber = new InputNumber({
        model: this.model,
        ppfx: this.ppfx
      });
      const input = inputNumber.render();
      this.$el.append(input.$el);
      this.$input = input.inputEl;
      this.$unit = input.unitEl;
      this.input = this.$input.get(0);
      this.inputInst = input;
    }
  },

});
