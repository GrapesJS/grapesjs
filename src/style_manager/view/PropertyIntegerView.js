var InputNumber = require('domain_abstract/ui/InputNumber');

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
    this.input.setValue(value, {silent: 1});
  },

  onRender() {
    if (!this.input) {
      var inputNumber = new InputNumber({
        model: this.model,
        ppfx: this.ppfx
      });
      this.input = inputNumber.render();
      this.$el.append(this.input.$el);
      this.$input = this.input.inputEl;
      this.$unit = this.input.unitEl;
    }
  },

});
