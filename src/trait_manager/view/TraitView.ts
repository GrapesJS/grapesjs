import { isFunction, isString, isUndefined } from 'underscore';
import { $, SetOptions, View } from '../../common';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';
import { capitalize } from '../../utils/mixins';
import Trait from '../model/Trait';

export default class TraitView extends View<Trait> {
  pfx: string;
  ppfx: string;
  config: any;
  clsField: string;
  elInput!: HTMLInputElement;
  input?: HTMLInputElement;
  $input?: JQuery<HTMLInputElement>;
  eventCapture!: string[];
  noLabel?: boolean;
  em: EditorModel;
  target: Component;
  createLabel?: (data: { label: string; component: Component; trait: TraitView }) => string | HTMLElement;
  createInput?: (data: ReturnType<TraitView['getClbOpts']>) => string | HTMLElement;

  events: any = {};

  appendInput = true;

  /** @ts-ignore */
  attributes() {
    return this.model.get('attributes') || {};
  }

  templateLabel(cmp?: Component) {
    const { ppfx } = this;
    const label = this.getLabel();
    return `<div class="${ppfx}label" title="${label}">${label}</div>`;
  }

  templateInput(data: ReturnType<TraitView['getClbOpts']>) {
    const { clsField } = this;
    return `<div class="${clsField}" data-input></div>`;
  }

  constructor(o: any = {}) {
    super(o);
    const { config = {} } = o;
    const { model, eventCapture } = this;
    const { target } = model;
    const { type } = model.attributes;
    this.config = config;
    this.em = config.em;
    this.ppfx = config.pStylePrefix || '';
    this.pfx = this.ppfx + config.stylePrefix || '';
    this.target = target;
    const { ppfx } = this;
    this.clsField = `${ppfx}field ${ppfx}field-${type}`;
    const evToListen: [string, any][] = [
      ['change:value', this.onValueChange],
      ['remove', this.removeView],
    ];
    evToListen.forEach(([event, clb]) => {
      model.off(event, clb);
      this.listenTo(model, event, clb);
    });
    model.view = this;
    this.listenTo(model, 'change:label', this.render);
    this.listenTo(model, 'change:placeholder', this.rerender);
    this.events = {};
    eventCapture.forEach(event => (this.events[event] = 'onChange'));
    this.delegateEvents();
    this.init();
  }

  getClbOpts() {
    return {
      component: this.target,
      trait: this.model,
      elInput: this.getInputElem(),
    };
  }

  removeView() {
    this.remove();
    this.removed();
  }

  init() {}
  removed() {}
  onRender(props: ReturnType<TraitView['getClbOpts']>) {}
  onUpdate(props: ReturnType<TraitView['getClbOpts']>) {}
  onEvent(props: ReturnType<TraitView['getClbOpts']> & { event: Event }) {}

  /**
   * Fires when the input is changed
   * @private
   */
  onChange(event: Event) {
    const el = this.getInputElem();
    if (el && !isUndefined(el.value)) {
      this.model.set('value', el.value);
    }
    this.onEvent({
      ...this.getClbOpts(),
      event,
    });
  }

  getValueForTarget() {
    return this.model.get('value');
  }

  setInputValue(value: string) {
    const el = this.getInputElem();
    el && (el.value = value);
  }

  /**
   * On change callback
   * @private
   */
  onValueChange(model: Trait, value: string, opts: SetOptions & { fromTarget?: boolean } = {}) {
    if (opts.fromTarget) {
      this.setInputValue(model.get('value'));
      this.postUpdate();
    } else {
      const val = this.getValueForTarget();
      model.setTargetValue(val, opts);
    }
  }

  /**
   * Render label
   * @private
   */
  renderLabel() {
    const { $el, target } = this;
    const label = this.getLabel();
    let tpl: string | HTMLElement = this.templateLabel(target);

    if (this.createLabel) {
      tpl =
        this.createLabel({
          label,
          component: target,
          trait: this,
        }) || '';
    }

    $el.find('[data-label]').append(tpl);
  }

  /**
   * Returns label for the input
   * @return {string}
   * @private
   */
  getLabel() {
    const { em } = this;
    const { label, name } = this.model.attributes;
    return em.t(`traitManager.traits.labels.${name}`) || capitalize(label || name).replace(/-/g, ' ');
  }

  /**
   * Returns current target component
   */
  getComponent() {
    return this.target;
  }

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      const { em, model } = this;
      const md = model;
      const { name } = model.attributes;
      const placeholder = md.get('placeholder') || md.get('default') || '';
      const type = md.get('type') || 'text';
      const min = md.get('min');
      const max = md.get('max');
      const value = this.getModelValue();
      const input: JQuery<HTMLInputElement> = $(`<input type="${type}">`);
      const i18nAttr = em.t(`traitManager.traits.attributes.${name}`) || {};
      input.attr({
        placeholder,
        ...i18nAttr,
      });

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
  }

  getInputElem() {
    const { input, $input } = this;
    return input || ($input && $input.get && $input.get(0)) || this.getElInput();
  }

  getModelValue() {
    let value;
    const model = this.model;
    const target = this.target;
    const name = model.getName();

    if (model.get('changeProp')) {
      value = target.get(name);
    } else {
      const attrs = target.get('attributes')!;
      value = model.get('value') || attrs[name];
    }

    return !isUndefined(value) ? value : '';
  }

  getElInput() {
    return this.elInput;
  }

  /**
   * Renders input
   * @private
   * */
  renderField() {
    const { $el, appendInput, model } = this;
    const inputs = $el.find('[data-input]');
    const el = inputs[inputs.length - 1];
    let tpl: HTMLElement | string | undefined = model.el;

    if (!tpl) {
      tpl = this.createInput ? this.createInput(this.getClbOpts()) : this.getInputEl();
    }

    if (isString(tpl)) {
      el.innerHTML = tpl;
      this.elInput = el.firstChild as HTMLInputElement;
    } else {
      appendInput ? el.appendChild(tpl!) : el.insertBefore(tpl!, el.firstChild);
      this.elInput = tpl as HTMLInputElement;
    }

    model.el = this.elInput;
  }

  hasLabel() {
    const { label } = this.model.attributes;
    return !this.noLabel && label !== false;
  }

  rerender() {
    delete this.model.el;
    this.render();
  }

  postUpdate() {
    this.onUpdate(this.getClbOpts());
  }

  render() {
    const { $el, pfx, ppfx, model } = this;
    const { type, id } = model.attributes;
    const hasLabel = this.hasLabel && this.hasLabel();
    const cls = `${pfx}trait`;
    delete this.$input;
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
}
TraitView.prototype.eventCapture = ['change'];
