import PropertyNumberView from './PropertyNumberView';
import InputColor from '../../domain_abstract/ui/InputColor';

export default class PropertyColorView extends PropertyNumberView {
  setValue(value: string) {
    this.inputInst?.setValue(value, {
      fromTarget: 1,
      def: this.model.getDefaultValue(),
    });
  }

  remove() {
    PropertyNumberView.prototype.remove.apply(this, arguments as any);
    const inp = this.inputInst;
    inp && inp.remove && inp.remove();
    // @ts-ignore
    ['inputInst', '$color'].forEach(i => (this[i] = null));
    return this;
  }

  __handleChange(value: string, partial: boolean) {
    this.model.upValue(value, { partial });
  }

  onRender() {
    if (!this.inputInst) {
      this.__handleChange = this.__handleChange.bind(this);
      const { ppfx, model, em, el } = this;
      const inputColor = new InputColor({
        target: em,
        model,
        ppfx,
        onChange: this.__handleChange,
      });
      const input = inputColor.render();
      el.querySelector(`.${ppfx}fields`)!.appendChild(input.el);
      this.input = input.inputEl?.get(0) as HTMLInputElement;
      this.inputInst = input;
    }
  }
}
