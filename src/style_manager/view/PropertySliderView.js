const InputNumber = require('domain_abstract/ui/InputNumber');

module.exports = require('./PropertyView').extend({

  events: {
    'change': 'inputValueChanged',
    'input': 'inputValueChangedSoft',
  },

  template(model) {
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    return `
      <div class="${pfx}label">
        ${this.templateLabel(model)}
      </div>
      <div class="${ppfx}fields">
        <div class="${ppfx}field ${ppfx}field-range">
          <input type="range"
            min="${model.get('min')}"
            max="${model.get('max')}"
            step="${model.get('step')}"/>
        </div>
      </div>
    `;
  },

  init() {
    console.log('Init slider');
    const model = this.model;
    this.listenTo(model, 'change:unit', this.modelValueChanged);
    this.listenTo(model, 'el:change', this.elementUpdated);
  },

  getSliderEl() {
    if (!this.slider) {
      this.slider = this.el.querySelector('input[type=range]');
    }

    return this.slider;
  },

  inputValueChanged() {
    const model = this.model;
    const step = model.get('step');
    this.getInputEl().value = this.getSliderEl().value;
    const value = this.getInputValue() - step;
    model.set('value', value, {avoidStore: 1}).set('value', value + step);
    this.elementUpdated();
  },

  inputValueChangedSoft() {
    this.getInputEl().value = this.getSliderEl().value;
    this.model.set('value', this.getInputValue(), {avoidStore: 1});
    this.elementUpdated();
  },

  setValue(value) {
    this.inputInst.setValue(value, {silent: 1});
  },

  onRender() {
    const ppfx = this.ppfx;

    if (!this.input) {
      const inputNumber = new InputNumber({
        model: this.model,
        ppfx: this.ppfx
      });
      const input = inputNumber.render();
      this.$el.find(`.${ppfx}fields`).append(input.$el);
      this.$input = input.inputEl;
      this.$unit = input.unitEl;
      this.input = this.$input.get(0);
      this.inputInst = input;
    }
  },

});
