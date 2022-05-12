import Backbone, { EventHandler } from 'backbone';
import { isUndefined, isString, isFunction } from 'underscore';
import { capitalize } from '../../utils/mixins';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';
import Trait from '../model/Trait';

const $ = Backbone.$;

export default class TraitView extends Backbone.View<Trait> {
  events: any = {}
  get eventCapture(){return ['change']};

  appendInput = true;
  noLabel = false;

  pfx: string;
  ppfx: string;
  config: any;
  clsField: string;
  elInput!: HTMLInputElement;
  input?: HTMLInputElement;
  $input?: JQuery<HTMLInputElement>;

  em: EditorModel;
  get target() {
    return this.model.target;
  }

  //@ts-ignore
  get attributes() {
    return this.model.get('attributes');
  }

  protected get templateLabel() {
    const { ppfx } = this;
    const label = this.getLabel();
    return `<div class="${ppfx}label" title="${label}">${label}</div>`;
  }

  protected get templateInput() {
    const { clsField } = this;
    return `<div class="${clsField}" data-input></div>`;
  }

  constructor(o: any = {}) {
    super(o);
    const { config = {} } = o;
    const { model, eventCapture } = this;
    const { type } = model.attributes;
    this.config = config;
    this.em = config.em;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    const { ppfx } = this;
    this.clsField = `${ppfx}field ${ppfx}field-${type}`;
    const signupEvents: {[id: string]: EventHandler} = {};
    signupEvents['change:value'] = this.onValueChange;
    signupEvents['remove'] = this.removeView;
    Object.entries(signupEvents).forEach(([event, clb]) => {
      model.off(event, clb);
      this.listenTo(model, event, clb);
    });
    //@ts-ignore
    model.view = this;
    this.listenTo(model, 'change:label', this.render);
    this.listenTo(model, 'change:placeholder', this.rerender);
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
  onRender(event: {component: Component, trait: Trait, elInput: HTMLElement}) {}
  onUpdate(event: {component: Component, trait: Trait, elInput: HTMLElement}) {}
  onEvent(event: {
    component: Component,
    trait: Trait,
    elInput: HTMLElement,
    event: Event
  }) {}

  /**
   * Fires when the input is changed
   */
  protected onChange(event: Event) {
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

  /**
   * On change callback
   * @private
   */
  onValueChange(model: Trait, value: any, opts: any = {}) {
    if (opts.fromTarget) {
      const el = this.getInputElem();
      el && (el.value = value);
      this.postUpdate();
    } else {
      model.setTargetValue(value, opts);
    }
  }

  /**
   * Render label
   * @private
   */
  private renderLabel() {
    const { $el } = this;
    let tpl = this.templateLabel;

    $el.find('[data-label]').append(tpl);
  }

  /**
   * Returns label for the input
   * @return {string}
   * @private
   */
  getLabel(): string {
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

  protected getInputEl() {
    if (!this.$input) {
      const { em, model } = this;
      const md = model;
      const { name } = model.attributes;
      const plh = md.get('placeholder') || md.get('default') || '';
      const type = md.get('type') || 'text';
      const min = md.get('min');
      const max = md.get('max');
      const value = this.getModelValue();
      const input = $(`<input type="${type}" placeholder="${plh}">`) as JQuery<HTMLInputElement>;
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
    return this.$input.get(0) as HTMLInputElement;
  }

  getInputElem() {
    const { input, $input } = this;
    return input || ($input && $input.get && $input.get(0)) || this.getElInput();
  }

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
    //@ts-ignore
    let tpl = model.el;

    if (!tpl) {
      //@ts-ignore
      tpl = this.createInput ? this.createInput(this.getClbOpts()) : this.getInputEl();
    }

    if (isString(tpl)) {
      el.innerHTML = tpl;
      //@ts-ignore
      this.elInput = el.firstChild;
    } else {
      appendInput ? el.appendChild(tpl) : el.insertBefore(tpl, el.firstChild);
      this.elInput = tpl;
    }

    //@ts-ignore
    model.el = this.elInput;
  }

  hasLabel() {
    const { label } = this.model.attributes;
    return !this.noLabel && label !== false;
  }

  rerender() {
    //@ts-ignore
    this.model.el = null;
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
    this.$input = undefined;
    let tmpl = `<div class="${cls} ${cls}--${type}">
      ${hasLabel ? `<div class="${ppfx}label-wrp" data-label></div>` : ''}
      <div class="${ppfx}field-wrp ${ppfx}field-wrp--${type}" data-input>
        ${this.templateInput}
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
