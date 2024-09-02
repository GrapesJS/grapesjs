import PropertyNumber from '../model/PropertyNumber';
import PropertyNumberView from './PropertyNumberView';

export default class PropertySliderView extends PropertyNumberView {
  slider?: HTMLInputElement;

  events() {
    return {
      ...PropertyNumberView.prototype.events(),
      'change [type=range]': 'inputValueChanged',
      'input [type=range]': 'inputValueChangedSoft',
      change: '',
    };
  }

  templateInput(model: PropertyNumber) {
    const { ppfx } = this;
    return `
      <div class="${ppfx}field ${ppfx}field-range">
        <input type="range" min="${model.get('min')}" max="${model.get('max')}" step="${model.get('step')}"/>
      </div>
    `;
  }

  getSliderEl() {
    if (!this.slider) {
      this.slider = this.el.querySelector('input[type=range]')!;
    }

    return this.slider;
  }

  inputValueChanged(ev: Event) {
    ev.stopPropagation();
    this.model.upValue(this.getSliderEl().value);
  }

  inputValueChangedSoft(ev: Event) {
    ev.stopPropagation();
    this.model.upValue(this.getSliderEl().value, { partial: true });
  }

  setValue(value: string) {
    const { model } = this;
    const parsed = model.parseValue(value);
    // @ts-ignore
    this.getSliderEl().value = value === '' ? model.getDefaultValue() : parseFloat(parsed.value);
    PropertyNumberView.prototype.setValue.apply(this, arguments as any);
  }

  onRender() {
    PropertyNumberView.prototype.onRender.apply(this, arguments as any);

    // @ts-ignore
    if (!this.model.get('showInput')) {
      this.inputInst.el.style.display = 'none';
    }
  }

  clearCached() {
    PropertyNumberView.prototype.clearCached.apply(this, arguments as any);
    delete this.slider;
  }
}
