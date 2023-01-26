import { View, $ } from '../../common';
import EditorModel from '../../editor/model/Editor';

export default class Input extends View {
  ppfx!: string;
  em!: EditorModel;
  opts!: any;
  inputEl?: any;

  template() {
    return `<span class="${this.holderClass()}"></span>`;
  }

  inputClass() {
    return `${this.ppfx}field`;
  }

  holderClass() {
    return `${this.ppfx}input-holder`;
  }

  constructor(opts: any = {}) {
    super(opts);
    const ppfx = opts.ppfx || '';
    this.opts = opts;
    this.ppfx = ppfx;
    this.em = opts.target || {};
    !opts.onChange && this.listenTo(this.model, 'change:value', this.handleModelChange);
  }

  /**
   * Fired when the element of the property is updated
   */
  elementUpdated() {
    this.model.trigger('el:change');
  }

  /**
   * Set value to the input element
   * @param {string} value
   */
  setValue(value: string, opts?: any) {
    const model = this.model;
    let val = value || model.get('defaults');
    const input = this.getInputEl();
    input && (input.value = val);
  }

  /**
   * Updates the view when the model is changed
   * */
  handleModelChange(model: any, value: string, opts: any) {
    this.setValue(value, opts);
  }

  /**
   * Handled when the view is changed
   */
  handleChange(e: Event) {
    e.stopPropagation();
    const value = this.getInputEl().value;
    this.__onInputChange(value);
    this.elementUpdated();
  }

  __onInputChange(value: string) {
    this.model.set({ value }, { fromInput: 1 });
  }

  /**
   * Get the input element
   * @return {HTMLElement}
   */
  getInputEl() {
    if (!this.inputEl) {
      const { model, opts } = this;
      const type = opts.type || 'text';
      const plh = model.get('placeholder') || model.get('defaults') || model.get('default') || '';
      this.inputEl = $(`<input type="${type}" placeholder="${plh}">`);
    }

    return this.inputEl.get(0);
  }

  render() {
    this.inputEl = null;
    const el = this.$el;
    el.addClass(this.inputClass());
    el.html(this.template());
    el.find(`.${this.holderClass()}`).append(this.getInputEl());
    return this;
  }
}

Input.prototype.events = {
  // @ts-ignore
  change: 'handleChange',
};
