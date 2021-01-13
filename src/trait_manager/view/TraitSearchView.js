import { template } from 'underscore';
import Backbone from 'backbone';

const $ = Backbone.$;

export default Backbone.View.extend({
  bs: 'Backspace',

  events: {},

  traits: [],

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
    console.log('Trait Search initialized');
    const ppfx = o.ppfx || '';
    this.em = o.editor;
    this.ppfx = ppfx;
    this.traits = o.traits ? o.traits : [];
    this.tv = o.traitsView;
    this.inputEl = $(
      `<input type="text" placeholder="${this.em.t(
        'traitManager.searchLabel'
      )}" forcefocus>`
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
    var index = 1;
    this.traits.models.forEach(element => {
      self = this;
      if (!element.get('name').includes(value)) {
        element.set('visible', false);
      } else {
        element.set('visible', true);
      }

      if (index >= self.traits.models.length) {
        self.tv.trigger('updateComps');
      } else {
        index++;
      }
    });
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
