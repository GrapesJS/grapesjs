import { isUndefined, clone } from 'underscore';

const Backbone = require('backbone');
const $ = Backbone.$;

module.exports = Backbone.View.extend({
  events: {
    change: 'onChange'
  },

  attributes() {
    return this.model.get('attributes');
  },

  initialize(o) {
    const model = this.model;
    const name = model.get('name');
    const target = model.target;
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.target = target;
    this.className = this.pfx + 'trait';
    this.labelClass = this.ppfx + 'label';
    this.fieldClass =
      this.ppfx + 'field ' + this.ppfx + 'field-' + model.get('type');
    this.inputhClass = this.ppfx + 'input-holder';
    model.off('change:value', this.onValueChange);
    this.listenTo(model, 'change:value', this.onValueChange);
    model.view = this;
    this.tmpl =
      '<div class="' +
      this.fieldClass +
      '"><div class="' +
      this.inputhClass +
      '"></div></div>';
  },

  /**
   * Fires when the input is changed
   * @private
   */
  onChange() {
    this.model.set('value', this.getInputEl().value);
  },

  getValueForTarget() {
    return this.model.get('value');
  },

  setInputValue(value) {
    this.getInputEl().value = value;
  },

  /**
   * On change callback
   * @private
   */
  onValueChange(model, value, opts = {}) {
    const mod = this.model;
    const trg = this.target;
    const name = mod.get('name');

    if (opts.fromTarget) {
      this.setInputValue(mod.get('value'));
    } else {
      const value = this.getValueForTarget();
      mod.setTargetValue(value, opts);
    }
  },

  /**
   * Render label
   * @private
   */
  renderLabel() {
    const label = this.getLabel();
    this.$el.html(
      `<div class="${this.labelClass}" title="${label}">${label}</div>`
    );
  },

  /**
   * Returns label for the input
   * @return {string}
   * @private
   */
  getLabel() {
    var model = this.model;
    var label = model.get('label') || model.get('name');
    return label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, ' ');
  },

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      const md = this.model;
      const plh = md.get('placeholder') || md.get('default') || '';
      const type = md.get('type') || 'text';
      const min = md.get('min');
      const max = md.get('max');
      const value = this.getModelValue();
      const input = $(`<input type="${type}" placeholder="${plh}">`);

      if (value) {
        input.prop('value', value);
      }

      if (min) {
        input.prop('min', min);
      }

      if (max) {
        input.prop('max', max);
      }

      this.$input = input;
    }
    return this.$input.get(0);
  },

  getModelValue() {
    let value;
    const model = this.model;
    const target = this.target;
    const name = model.get('name');

    if (model.get('changeProp')) {
      value = target.get(name);
    } else {
      const attrs = target.get('attributes');
      value = model.get('value') || attrs[name];
    }

    return !isUndefined(value) ? value : '';
  },

  /**
   * Renders input
   * @private
   * */
  renderField() {
    if (!this.$input) {
      this.$el.append(this.tmpl);
      const el = this.getInputEl();
      // I use prepand expecially for checkbox traits
      const inputWrap = this.el.querySelector(`.${this.inputhClass}`);
      inputWrap.insertBefore(el, inputWrap.childNodes[0]);
    }
  },

  render() {
    this.renderLabel();
    this.renderField();
    this.el.className = this.className;
    return this;
  }
});
