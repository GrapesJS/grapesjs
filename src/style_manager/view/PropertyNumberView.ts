import PropertyView from './PropertyView';

export default class PropertyNumberView extends PropertyView {
  inputInst?: any;

  templateInput(m: any) {
    return '';
  }

  init() {
    const model = this.model;
    this.listenTo(model, 'change:unit', this.onValueChange);
    this.listenTo(model, 'change:units', this.render);
  }

  setValue(v: string) {
    // handled by this.inputInst
  }

  onRender() {
    const { ppfx, model, el } = this;

    if (!this.inputInst) {
      const { input } = model as any;
      input.ppfx = ppfx;
      input.render();
      const fields = el.querySelector(`.${ppfx}fields`)!;
      fields.appendChild(input.el);
      this.input = input.inputEl.get(0);
      this.inputInst = input;
    }
  }

  clearCached() {
    PropertyView.prototype.clearCached.apply(this, arguments as any);
    this.inputInst = null;
  }
}
