import Property from './PropertyNumberView';

export default class PropertySliderView extends Property {
  events() {
    return {
      ...Property.prototype.events,
      'change [type=range]': 'inputValueChanged',
      'input [type=range]': 'inputValueChangedSoft',
      change: '',
    };
  }

  templateInput(model) {
    const { ppfx } = this;
    return `
      <div class="${ppfx}field ${ppfx}field-range">
        <input type="range" min="${model.get('min')}" max="${model.get('max')}" step="${model.get('step')}"/>
      </div>
    `;
  }

  getSliderEl() {
    if (!this.slider) {
      this.slider = this.el.querySelector('input[type=range]');
    }

    return this.slider;
  }

  inputValueChanged() {
    this.model.upValue(this.getSliderEl().value);
  }

  inputValueChangedSoft() {
    this.model.upValue(this.getSliderEl().value, { partial: true });
  }

  setValue(value) {
    const { model } = this;
    const parsed = model.parseValue(value);
    this.getSliderEl().value = value === '' ? model.getDefaultValue() : parseFloat(parsed.value);
    Property.prototype.setValue.apply(this, arguments);
  }

  onRender() {
    Property.prototype.onRender.apply(this, arguments);

    if (!this.model.get('showInput')) {
      this.inputInst.el.style.display = 'none';
    }
  }

  clearCached() {
    Property.prototype.clearCached.apply(this, arguments);
    this.slider = null;
  }
}
