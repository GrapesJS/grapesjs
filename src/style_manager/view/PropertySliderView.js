import Property from './PropertyIntegerView';

export default Property.extend({
  events() {
    return {
      ...Property.prototype.events,
      'change [type=range]': 'inputValueChanged',
      'input [type=range]': 'inputValueChangedSoft',
      change: ''
    };
  },

  templateInput(model) {
    const ppfx = this.ppfx;
    return `
      <div class="${ppfx}field ${ppfx}field-range">
        <input type="range"
          min="${model.get('min')}"
          max="${model.get('max')}"
          step="${model.get('step')}"/>
      </div>
    `;
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
    model.set('value', value, { avoidStore: 1 }).set('value', value + step);
    this.elementUpdated();
  },

  inputValueChangedSoft() {
    this.getInputEl().value = this.getSliderEl().value;
    this.model.set('value', this.getInputValue(), { avoidStore: 1 });
    this.elementUpdated();
  },

  setValue(value) {
    const parsed = this.model.parseValue(value);
    this.getSliderEl().value = parseFloat(parsed.value);
    Property.prototype.setValue.apply(this, arguments);
  },

  onRender() {
    Property.prototype.onRender.apply(this, arguments);

    if (!this.model.get('showInput')) {
      this.inputInst.el.style.display = 'none';
    }
  },

  clearCached() {
    Property.prototype.clearCached.apply(this, arguments);
    this.slider = null;
  }
});
