import Backbone from 'backbone';
import { isUndefined, isString, isFunction } from 'underscore';
import { capitalize } from 'utils/mixins';

const $ = Backbone.$;

export default Backbone.View.extend({
  events: {},
  eventCapture: ['change'],

  appendInput: 1,

  attributes() {
    return this.model && this.model[0].get('attributes');
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
    const { model, eventCapture } = this;
    //const { target } = model;
    const type = model ? model[0].attributes.type : '';
    this.config = config;
    this.em = config.em;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    // this.target = target;
    const { ppfx } = this;
    this.clsField = `${ppfx}field ${ppfx}field-${type}`;
    [
      ['change:value', this.onValueChange],
      ['remove', this.removeView]
    ].forEach(([event, clb]) => {
      model &&
        model.forEach(modelRef => {
          modelRef.off(event, clb);
          this.listenTo(modelRef, event, clb);
        });
    });

    model &&
      model.forEach(modelRef => {
        modelRef.view = this;
        this.listenTo(modelRef, 'change:label', this.render);
        this.listenTo(modelRef, 'change:placeholder', this.rerender);
      });

    eventCapture.forEach(event => (this.events[event] = 'onChange'));
    this.delegateEvents();
    this.init();
  },

  getClbOpts() {
    return {
      component: this.model,
      trait: this.model,
      elInput: this.getInputElem()
    };
  },

  removeView() {
    this.remove();
    this.removed();
  },

  init() {},
  removed() {},
  onRender() {},
  onUpdate() {},
  onEvent() {},

  /**
   * Fires when the input is changed
   * @private
   */
  onChange(event) {
    const el = this.getInputElem();
    if (el && !isUndefined(el.value)) {
      this.model.forEach(modelRef => {
        modelRef.set('value', el.value);
      });
    }

    this.onEvent({
      ...this.getClbOpts(),
      event
    });
  },

  getValueForTarget() {
    return this.model[0].get('value');
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
      this.postUpdate();
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
    const { $el, model } = this;
    const label = this.getLabel();
    let tpl = this.templateLabel(model[0]);

    if (this.createLabel) {
      tpl =
        this.createLabel({
          label,
          component: model[0],
          trait: this
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
    const { em } = this;
    const { label, name } = this.model
      ? this.model[0].attributes
      : { label: '', name: '' };
    return (
      em.t(`traitManager.traits.labels.${name}`) ||
      capitalize(label || name).replace(/-/g, ' ')
    );
  },

  /**
   * Returns current target component
   */
  getComponent() {
    return this.model[0];
  },

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      const { em, model } = this;
      const md = model ? model[0] : undefined;
      const { name } = model ? model[0].attributes : { name: '' };
      const plh = md.get('placeholder') || md.get('default') || '';
      const type = md.get('type') || 'text';
      const min = md.get('min');
      const max = md.get('max');
      const value = this.getModelValue();
      const input = $(`<input type="${type}" placeholder="${plh}">`);
      const i18nAttr = em.t(`traitManager.traits.attributes.${name}`) || {};
      input.attr(i18nAttr);

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
    return (
      input || ($input && $input.get && $input.get(0)) || this.getElInput()
    );
  },

  getModelValue() {
    let value;
    const model = this.model;
    const target = this.model[0];
    const name = model ? model[0].get('name') : '';

    if (model && model[0].get('changeProp')) {
      value = target.get(name);
    } else {
      const attrs = target.attributes;
      value = (model && model[0].get('value')) || attrs[name];
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
    const { $el, appendInput, model } = this;
    const inputs = $el.find('[data-input]');
    const el = inputs[inputs.length - 1];
    let tpl = model.el;

    if (!tpl) {
      tpl = this.createInput
        ? this.createInput(this.getClbOpts())
        : this.getInputEl();
    }

    if (isString(tpl)) {
      el.innerHTML = tpl;
      this.elInput = el.firstChild;
    } else {
      appendInput ? el.appendChild(tpl) : el.insertBefore(tpl, el.firstChild);
      this.elInput = tpl;
    }

    model.el = this.elInput;
  },

  hasLabel() {
    const { label } = this.model ? this.model[0].attributes : { label: '' };
    return !this.noLabel && label !== false;
  },

  rerender() {
    this.model.el = null;
    this.render();
  },

  postUpdate() {
    this.onUpdate(this.getClbOpts());
  },

  render() {
    const { $el, pfx, ppfx, model } = this;
    const { type, id } = model ? model[0].attributes : { type: '', id: '' };
    const hasLabel = this.hasLabel && this.hasLabel();
    const cls = `${pfx}trait`;
    this.$input = null;
    let tmpl = `<div class="${cls} ${cls}--${type}">
      ${hasLabel ? `<div class="${ppfx}label-wrp" data-label></div>` : ''}
      <div class="${ppfx}field-wrp ${ppfx}field-wrp--${type}" data-input>
        ${
          this.templateInput
            ? isFunction(this.templateInput)
              ? this.templateInput(this.getClbOpts())
              : this.templateInput
            : ''
        }
      </div>
    </div>`;
    $el.empty().append(tmpl);
    hasLabel && this.renderLabel();
    this.renderField();
    this.el.className = `${cls}__wrp ${cls}__wrp-${id}`;
    this.postUpdate();
    this.onRender(this.getClbOpts());
    return this;
  }
});
