import Backbone from 'backbone';
import PropertyView from './PropertyView';

const $ = Backbone.$;

export default PropertyView.extend({
  templateInput() {
    return '';
  },

  init() {
    const model = this.model;
    this.listenTo(model, 'change:unit', this.modelValueChanged);
    this.listenTo(model, 'el:change', this.elementUpdated);
    this.listenTo(model, 'change:units', this.render);
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
  },

  clearCached() {
    PropertyView.prototype.clearCached.apply(this, arguments);
    this.unit = null;
    this.$unit = null;
  }
});
