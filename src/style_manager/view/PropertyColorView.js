import PropertyIntegerView from './PropertyIntegerView';
import InputColor from 'domain_abstract/ui/InputColor';

export default PropertyIntegerView.extend({
  setValue(value, opts = {}) {
    opts = { ...opts, silent: 1 };
    this.inputInst.setValue(value, opts);
  },

  onRender() {
    if (!this.input) {
      const ppfx = this.ppfx;
      const inputColor = new InputColor({
        target: this.target,
        model: this.model,
        ppfx
      });
      const input = inputColor.render();
      this.el.querySelector(`.${ppfx}fields`).appendChild(input.el);
      this.$input = input.inputEl;
      this.$color = input.colorEl;
      this.input = this.$input.get(0);
      this.inputInst = input;
    }
  }
});
