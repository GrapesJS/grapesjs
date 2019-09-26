import TraitView from './TraitView';
import InputColor from 'domain_abstract/ui/InputColor';

export default TraitView.extend({
  templateInput: '',

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.input) {
      const model = this.model;
      const value = this.getModelValue();
      const inputColor = new InputColor({
        model,
        target: this.config.em,
        contClass: this.ppfx + 'field-color',
        ppfx: this.ppfx
      });
      const input = inputColor.render();
      input.setValue(value, { fromTarget: 1 });
      this.input = input.el;
    }

    return this.input;
  }
});
