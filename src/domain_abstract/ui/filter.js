import { template } from 'underscore';
import Backbone from 'backbone';

const $ = Backbone.$;

export default Backbone.View.extend({
  bs: 'Backspace',

  events: {},

  events: {
    input: 'handleChange'
  },

  holderClass() {
    return `${this.ppfx}input-holder`;
  },

  inputClass() {
    return `${this.ppfx}field`;
  },

  initialize(o = {}) {
    const ppfx = o.ppfx || '';
    (this.clb = o.clb), (this.em = o.editor);
    this.ppfx = ppfx;
    this.inputEl = $(
      `<input type="text" placeholder="${this.em.t(
        'traitManager.searchLabel'
      )}">`
    );
  },

  template() {
    return `
    <div class=${this.holderClass()}>
    </div>
    `;
  },

  getInputElement() {
    return this.inputEl.get(0);
  },

  handleChange(e) {
    e.stopPropagation();
    const inputEl = this.getInputElement();
    const value = inputEl.value;
    this.clb && this.clb(value);
    this.getInputElement().focus();
  },

  render() {
    if (!this.rendered) {
      const el = this.$el;
      el.addClass(this.inputClass());
      el.html(this.template());
      el.find(`.${this.holderClass()}`).append(this.getInputElement());
      this.rendered = true;
    }

    return this;
  }
});
