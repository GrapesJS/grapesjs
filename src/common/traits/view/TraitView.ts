import { EventsHash } from 'backbone';
import { isString, isUndefined } from 'underscore';
import { InputViewProperties } from '..';
import { Model } from '../..';
import { $, View } from '../../../common';
import EditorModel from '../../../editor/model/Editor';
import { capitalize } from '../../../utils/mixins';
import Trait, { OnUpdateView, TraitProperties } from '../model/Trait';

export interface TraitViewOpts {
  default?: any;
  name?: string;
  label?: string;
  paceholder?: string;
  noLabel?: boolean;
}

type ModelFromTrait<TTarget extends Trait> = TTarget extends Trait<infer M, any> ? M : unknown;
type ValueFromTrait<TTarget extends Trait> = TTarget extends Trait<any, infer M> ? M : unknown;

export default abstract class TraitView<Target extends Trait = Trait>
  extends View<ModelFromTrait<Target>>
  implements OnUpdateView<ValueFromTrait<Target>>
{
  pfx: string;
  ppfx: string;
  name?: string;
  paceholder?: string;
  protected abstract type: string;

  get clsField() {
    const { ppfx, type } = this;
    return `${ppfx}field ${ppfx}field-${type}`;
  }

  elInput?: HTMLInputElement;
  input?: HTMLInputElement;
  $input?: JQuery<HTMLInputElement>;
  eventCapture!: string[];
  noLabel: boolean;
  em: EditorModel;
  target!: Target;

  events(): EventsHash {
    return {
      change: this.onChange,
    };
  }

  appendInput = true;

  templateLabel() {
    const { ppfx, name } = this;
    const label = this.getLabel();
    return `<div class="${ppfx}label" title="${name}">${label}</div>`;
  }

  templateInput(defaultValue: ValueFromTrait<Target>) {
    const { clsField } = this;
    return `<div class="${clsField}" data-input></div>`;
  }

  constructor(em: EditorModel, opts?: TraitViewOpts) {
    super({});
    this.em = em;
    const config = this.em.Traits.config;
    this.ppfx = config.pStylePrefix || '';
    this.pfx = this.ppfx + config.stylePrefix || '';
    this.name = opts?.name;
    this.noLabel = opts?.noLabel ?? false;
  }

  setTarget(popertyName: string, model: ModelFromTrait<Target>, opts?: TraitProperties): this;
  setTarget(target: Target): this;
  setTarget(target: unknown, model?: ModelFromTrait<Target>, opts?: TraitProperties) {
    if (isString(target) && model !== undefined) {
      target = new Trait(target, model, opts);
    }
    this.target = target as Target;
    this.model = this.target.model as any;
    this.name ?? (this.name = this.target.name);
    // this.listenTo(model, 'change:label', this.render);
    // this.listenTo(model, 'change:placeholder', this.rerender);
    this.target.registerForUpdateEvent(this);
    return this;
  }

  abstract get inputValue(): ValueFromTrait<Target>;

  abstract set inputValue(value: ValueFromTrait<Target>);

  /**
   * Fires when the input is changed
   * @private
   */
  onChange() {
    this.target.value = this.inputValue;
  }

  onUpdateEvent(value: ValueFromTrait<Target>) {
    this.inputValue = value;
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
        placeholder: this.paceholder || value,
        ...i18nAttr,
      });

      if (!isUndefined(value)) {
        input.prop('value', value as any);
      }

      this.$input = input;
    }
    return this.$input.get(0);
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
    return !this.noLabel;
  }

  rerender() {
    delete this.elInput;
    this.render();
  }

  render() {
    const { $el, pfx, ppfx, name, type } = this;
    const hasLabel = this.hasLabel();
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
