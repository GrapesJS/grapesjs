import Backbone from 'backbone';
const InputNumber = require('domain_abstract/ui/InputNumber');
const PropertyView = require('./PropertyView');
const $ = Backbone.$;
let timeout;

module.exports = PropertyView.extend({
  templateInput() {
    return '';
  },

  init() {
    const model = this.model;
    this.listenTo(model, 'change:unit', this.modelValueChanged);
    this.listenTo(model, 'el:change', this.elementUpdated);
  },

  setValue(value) {
    const parsed = this.model.parseValue(value);
    value = `${parsed.value}${parsed.unit}`;
    this.inputInst.setValue(value, { silent: 1 });
  },

  onRender() {
    const ppfx = this.ppfx;

    if (!this.input) {
      const input = this.model.input;
      input.ppfx = ppfx;
      input.render();
      const fields = this.el.querySelector(`.${ppfx}fields`);
      fields.appendChild(input.el);
      this.$input = input.inputEl;
      this.unit = input.unitEl;
      this.$unit = $(this.unit);
      this.input = this.$input.get(0);
      this.inputInst = input;
    }
  }
});
