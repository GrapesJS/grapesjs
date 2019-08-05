import Backbone from 'backbone';
import { isUndefined, isString } from 'underscore';

const $ = Backbone.$;

export default Backbone.View.extend({
  events: {
    change: 'onChange'
  },

  appendInput: 1,

  attributes() {
    return this.model.get('attributes');
  },

  templateLabel() {
    const { ppfx } = this;
    const label = this.getLabel();
    return `<div class="${ppfx}label" title="${label}">${label}</div>`;
  },

  templateInput() {
    const { clsField } = this;
    return `<div class="${clsField}" data-input></div>`;
  },

  initialize(o = {}) {
    const { config = {} } = o;
    const { model } = this;
    const { target } = model;
    const { type } = model.attributes;
    this.config = config;
    this.em = config.em;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.target = target;
    const { ppfx } = this;
    this.clsField = `${ppfx}field ${ppfx}field-${type}`;
    model.off('change:value', this.onValueChange);
    this.listenTo(model, 'change:value', this.onValueChange);
    model.view = this;
    this.init();
  },

  init() {},

  /**
   * Fires when the input is changed
   * @private
   */
  onChange() {
    this.model.set('value', this.getInputElem().value);
  },

  getValueForTarget() {
    return this.model.get('value');
  },

  setInputValue(value) {
    const el = this.getInputElem();
    el && (el.value = value);
  },

  /**
   * On change callback
   * @private
   */
  onValueChange(model, value, opts = {}) {
    if (opts.fromTarget) {
      this.setInputValue(model.get('value'));
    } else {
      const val = this.getValueForTarget();
      model.setTargetValue(val, opts);
    }
  },

  /**
   * Render label
   * @private
   */
  renderLabel() {
    const { $el, target } = this;
    const label = this.getLabel();
    let tpl = this.templateLabel(target);

    if (this.createLabel) {
      tpl =
        this.createLabel({
          label,
          component: target
        }) || '';
    }

    $el.find('[data-label]').append(tpl);
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
   * Returns current target component
   */
  getComponent() {
    return this.target;
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

      if (!isUndefined(value)) {
        md.set({ value }, { silent: true });
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

  getInputElem() {
    const { input, $input } = this;
    return input || ($input && $input.get(0));
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

  getElInput() {
    return this.elInput;
  },

  /**
   * Renders input
   * @private
   * */
  renderField() {
    const { $el, target, appendInput } = this;
    const inputOpts = { component: target };
    const inputs = $el.find('[data-input]');
    const el = inputs[inputs.length - 1];
    let tpl = this.createInput
      ? this.createInput(inputOpts)
      : this.getInputEl();

    if (isString(tpl)) {
      el.innerHTML = tpl;
      this.elInput = el.firstChild;
    } else {
      appendInput ? el.appendChild(tpl) : el.insertBefore(tpl, el.firstChild);
      this.elInput = tpl;
    }
  },

  render() {
    const { $el, pfx, ppfx, model } = this;
    const { noLabel, type } = model.attributes;
    const cls = `${pfx}trait`;
    this.$input = null;
    let tmpl = `<div class="${cls}">
      ${!noLabel ? `<div class="${ppfx}label-wrp" data-label></div>` : ''}
      <div class="${ppfx}field-wrp ${ppfx}field-wrp--${type}" data-input>
        ${this.templateInput && this.templateInput()}
      </div>
    </div>`;
    $el.empty().append(tmpl);
    !noLabel && this.renderLabel();
    this.renderField();
    this.el.className = `${cls}__wrp`;
    return this;
  }
});
