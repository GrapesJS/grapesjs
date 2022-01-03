import PropertyNumberView from './PropertyNumberView';
import InputColor from 'domain_abstract/ui/InputColor';

export default PropertyNumberView.extend({
  setValue(value, opts = {}) {
    opts = { ...opts, silent: 1 };
    this.inputInst.setValue(value, opts);
  },

  remove() {
    PropertyNumberView.prototype.remove.apply(this, arguments);
    const inp = this.inputInst;
    inp && inp.remove && inp.remove();
    ['inputInst', '$color'].forEach(i => (this[i] = {}));
  },

  onRender() {
    if (!this.inputInst) {
      const { ppfx, model, em, el } = this;
      const inputColor = new InputColor({ target: em, model, ppfx });
      const input = inputColor.render();
      el.querySelector(`.${ppfx}fields`).appendChild(input.el);
      this.input = input.inputEl.get(0);
      this.inputInst = input;
    }
  },
});
