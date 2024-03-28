import { template } from 'underscore';
import Backbone from 'backbone';
import $ from '../utils/cash-dom';

//const $ = Backbone.$;

export default Backbone.View.extend({
  events: {
    input: 'handleChange',
    'click [data-clear]': 'clearInput',
  },

  iconDelete:
    '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>',

  holderClass() {
    return `${this.ppfx}input-holder`;
  },

  inputClass() {
    return `${this.ppfx}field`;
  },

  initialize(o = {}) {
    const ppfx = o.ppfx || '';
    this.clb = o.clb;
    this.em = o.editor;
    this.ppfx = ppfx;
  },

  template() {
    return `
      <div style="padding: 5px; display: flex; justify-content: flex-end;">
        <div class=${this.holderClass()} style="display: flex; width: 100%">
        </div>
        <span class="${this.ppfx}clm-tags-btn" style="justify-content: flex-center;" data-clear>
          ${this.iconDelete} 
        </span>
      </div>
    `;
  },

  getInputElement() {
    if (!this.inputEl) {
      const label = this.em ? this.em.t('panels.searchLabel') : '';
      this.inputEl = $(`<input type="text" placeholder="${label}">`);
    }

    return this.inputEl.get(0);
  },

  handleChange(e) {
    e.stopPropagation();
    const inputEl = this.getInputElement();
    const value = inputEl.value;
    this.clb && this.clb(value);
    this.getInputElement().focus();
  },

  clearInput(e) {
    const inputEl = this.getInputElement();
    inputEl.value = '';
    this.clb && this.clb(inputEl.value);
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
  },
});
