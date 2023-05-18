import Backbone from 'backbone';
import { isUndefined, isString, isFunction } from 'underscore';
import { capitalize } from 'utils/mixins';

const $ = Backbone.$;

export default Backbone.View.extend({
  events: {},
  eventCapture: ['change'],

  appendInput: 1,

  attributes() {
    return this.models && this.models[0].get('attributes');
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
    const { eventCapture } = this;
    this.models = o.models;
    //const { target } = models;
    const type = this.models ? this.models[0].attributes.type : '';
    this.config = config;
    this.em = config.em;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    // this.target = target;
    const { ppfx } = this;
    this.clsField = `${ppfx}field ${ppfx}field-${type}`;
    [['change:value', this.onValueChange], ['remove', this.removeView]].forEach(
      ([event, clb]) => {
        this.models &&
          this.models.forEach(modelRef => {
            modelRef.off(event, clb);
            this.listenTo(modelRef, event, clb);
          });
      }
    );

    this.models &&
      this.models.forEach(modelRef => {
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
      component: this.models,
      trait: this.models,
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

    if (el) {
      // favor the query-selected input value because for some reason
      // "sometimes" the el.value is old
      let valueToUse = el.value;
      const input = el.querySelector('input'); // alas, Javascript...
      if (input && input.value) {
        valueToUse = input.value;
      }

      if (!isUndefined(valueToUse)) {
        const { em } = this;
        em.trigger('traitview:change', this, this.models, valueToUse); // this event is not a native GrapesJS event, it was added for CCIDE

        //** CCIDE optimization
        const setProperty = function(modelRef, value) {
          modelRef.set('value', value, { fromInput: 1 });
        };

        const magicIndex = this.models.length - 1; //upper limit of for loop & index of last models element
        if (magicIndex > 0) {
          this.em.disableCollectionUpdateEventHandling();

          for (let i = 0; i < magicIndex; i += 1) {
            try {
              setProperty(this.models[i], valueToUse);
            } catch (e) {
              console.error('Error setting trait', e);
            }
          }
          this.em.enableCollectionUpdateEventHandling();
        }

        setProperty(this.models[magicIndex], valueToUse);
      }
    }

    this.onEvent({
      ...this.getClbOpts(),
      event
    });
  },

  getValueForTarget() {
    return this.models[0].get('value');
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
    const { $el } = this;
    const label = this.getLabel();
    let tpl = this.templateLabel(this.models[this.models.length - 1]);

    if (this.createLabel) {
      tpl =
        this.createLabel({
          label,
          component: this.models[0],
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
    const { label, name } = this.models
      ? this.models[this.models.length - 1].attributes
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
    return this.models[0];
  },

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      //const { em, models } = this;
      const md = this.models ? this.models[0] : undefined;
      const { name } = this.models ? this.models[0].attributes : { name: '' };
      const plh = md.get('placeholder') || md.get('default') || '';
      const type = md.get('type') || 'text';
      const min = md.get('min');
      const max = md.get('max');
      const value = this.getModelValue();
      const input = $(`<input type="${type}" placeholder="${plh}">`);
      const i18nAttr =
        this.em.t(`traitManager.traits.attributes.${name}`) || {};
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
    const models = this.models;
    const target = this.models[0];
    const name = models ? models[0].get('name') : '';

    if (models && models[0].get('changeProp')) {
      value = target.get(name);
    } else {
      const attrs = target.attributes;

      value = (models && models[0].get('value')) || attrs[name];
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
    const { $el, appendInput, models } = this;
    const inputs = $el.find('[data-input]');
    const el = inputs[inputs.length - 1];
    let tpl = this.models && this.models[this.models.length - 1].el;

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

    this.models[this.models.length - 1].el = this.elInput;
  },

  hasLabel() {
    const { label } = this.model ? this.model[0].attributes : { label: '' };
    return !this.noLabel && label !== false;
  },

  rerender() {
    this.models.el = null;
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
