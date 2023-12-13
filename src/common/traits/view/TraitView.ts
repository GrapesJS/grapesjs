import { isUndefined } from 'underscore';
import { Model } from '../..';
import { $, View } from '../../../common';
import EditorModel from '../../../editor/model/Editor';
import { capitalize } from '../../../utils/mixins';
import Trait, { OnUpdateView } from '../model/Trait';

export interface TraitViewOpts {
  em: EditorModel;
  default?: any;
  name?: string;
}

export default abstract class TraitView<TModel extends Model, TraitValueType>
  extends View<TModel>
  implements OnUpdateView<TraitValueType>
{
  pfx: string;
  ppfx: string;
  name?: string;
  protected abstract type: string;

  get clsField() {
    const { ppfx, type } = this;
    return `${ppfx}field ${ppfx}field-${type}`;
  }
  elInput?: HTMLInputElement;
  input?: HTMLInputElement;
  $input?: JQuery<HTMLInputElement>;
  eventCapture!: string[];
  noLabel?: boolean;
  em: EditorModel;
  target: Trait<TraitValueType>;
  events: any = {};

  appendInput = true;

  templateLabel() {
    const { ppfx, name } = this;
    const label = this.getLabel();
    return `<div class="${ppfx}label" title="${name}">${label}</div>`;
  }

  templateInput(defaultValue: TraitValueType) {
    const { clsField } = this;
    return `<div class="${clsField}" data-input></div>`;
  }

  constructor(popertyName: string, model: TModel, opts: TraitViewOpts) {
    super({ model });
    const { eventCapture } = this;
    this.em = opts.em;
    const config = this.em.Traits.config;
    this.ppfx = config.pStylePrefix || '';
    this.pfx = this.ppfx + config.stylePrefix || '';
    this.name = opts.name;
    this.target = new Trait(popertyName, model, opts.default ?? '');
    this.target.registerForUpdateEvent(this);
    const { ppfx } = this;

    this.listenTo(model, 'change:label', this.render);
    this.listenTo(model, 'change:placeholder', this.rerender);
    this.events = {};
    eventCapture.forEach(event => (this.events[event] = 'onChange'));
  }

  /**
   * Fires when the input is changed
   * @private
   */
  onChange(event: Event) {
    const el = this.getInputElem();
    if (el && !isUndefined(el.value)) {
      this.target.value = el.value as any;
    }
  }

  onUpdateEvent(value: TraitValueType) {
    const el = this.getInputElem();
    el && (el.value = value as any);
    return el as any;
  }

  /**
   * Render label
   */
  private renderLabel() {
    const { $el } = this;
    let tpl: string | HTMLElement = this.templateLabel();
    $el.find('[data-label]').append(tpl);
  }

  /**
   * Returns label for the input
   */
  protected getLabel(): string {
    const { em, name } = this;
    return em.t(`traitManager.traits.labels.${name}`) || capitalize(name).replace(/-/g, ' ');
  }

  /**
   * Returns input element
   * @return {HTMLElement}
   */
  protected getInputEl() {
    if (!this.$input) {
      const { em, name, type } = this;
      const value = this.target.value;
      const input: JQuery<HTMLInputElement> = $(`<input type="${type}">`);
      const i18nAttr = em.t(`traitManager.traits.attributes.${name}`) || {};
      input.attr({
        placeholder: value,
        ...i18nAttr,
      });

      if (!isUndefined(value)) {
        input.prop('value', value as any);
      }

      this.$input = input;
    }
    return this.$input.get(0);
  }

  getInputElem() {
    const { input, $input } = this;
    return input || ($input && $input.get && $input.get(0)) || this.getElInput();
  }

  getElInput() {
    return this.elInput;
  }

  /**
   * Renders input
   * @private
   * */
  renderField() {
    const { $el, appendInput, elInput } = this;
    const inputs = $el.find('[data-input]');
    const el = inputs[inputs.length - 1];

    if (!elInput) {
      this.elInput = this.getInputEl();
      appendInput ? el.appendChild(this.elInput!) : el.insertBefore(this.elInput!, el.firstChild);
    }
  }

  hasLabel() {
    const { label } = this.model.attributes;
    return !this.noLabel && label !== false;
  }

  rerender() {
    delete this.elInput;
    this.render();
  }

  render() {
    const { $el, pfx, ppfx, name, type } = this;
    const hasLabel = this.hasLabel && this.hasLabel();
    const cls = `${pfx}trait`;
    delete this.$input;
    let tmpl = `<div class="${cls} ${cls}--${type}">
      ${hasLabel ? `<div class="${ppfx}label-wrp" data-label></div>` : ''}
      <div class="${ppfx}field-wrp ${ppfx}field-wrp--${type}" data-input>
        ${this.templateInput(this.target.value)}
      </div>
    </div>`;
    $el.empty().append(tmpl);
    hasLabel && this.renderLabel();
    this.renderField();
    this.el.className = `${cls}__wrp ${cls}__wrp-${name}`;
    this.setElement(this.el);
    return this;
  }
}

TraitView.prototype.eventCapture = ['change'];
