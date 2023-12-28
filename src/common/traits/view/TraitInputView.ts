import { EventsHash } from 'backbone';
import { isString, isUndefined } from 'underscore';
import TraitFactory from '../model/TraitFactory';
import { Model } from '../..';
import { $, View } from '../..';
import EditorModel from '../../../editor/model/Editor';
import { capitalize } from '../../../utils/mixins';
import Trait, { OnUpdateView, TraitProperties } from '../model/Trait';
import TraitView, { TraitViewOpts } from './TraitView';

export interface TraitInputViewOpts<Type> extends TraitViewOpts<Type> {
  default?: any;
  paceholder?: string;
}

// type ModelFromTrait<TTarget extends Trait> = TTarget extends Trait<infer M, any> ? M : unknown;
type ValueFromTrait<TTarget extends Trait> = TTarget extends Trait<infer M> ? M : unknown;

export default abstract class TraitInputView<Target extends Trait = Trait>
  extends TraitView<Target>
  implements OnUpdateView<ValueFromTrait<Target>>
{
  paceholder?: string;
  protected abstract type: string;

  get clsField() {
    const { ppfx, type } = this;
    return `${ppfx}field ${ppfx}field-${type}`;
  }

  get clsLabel() {
    const { ppfx } = this;
    return `${ppfx}label-wrp`;
  }

  elInput?: HTMLInputElement;
  input?: HTMLInputElement;
  $input?: JQuery<HTMLInputElement>;
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

  protected constructor(em: EditorModel, opts?: TraitInputViewOpts<string>) {
    super(em, opts);
  }

  abstract get inputValue(): ValueFromTrait<Target>;

  abstract set inputValue(value: ValueFromTrait<Target>);

  /**
   * Fires when the input is changed
   * @private
   */
  onChange() {
    console.log('traitchange');
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
    const label = name ?? this.label;
    return em.t(`traitManager.traits.labels.${label}`) || capitalize(label).replace(/-/g, ' ');
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

  rerender() {
    delete this.elInput;
    this.render();
  }

  render() {
    const { $el, pfx, ppfx, name, type, clsLabel } = this;
    const hasLabel = this.hasLabel();
    const cls = `${pfx}trait`;
    delete this.$input;
    let tmpl = `<div class="${cls} ${cls}--${type}">
      ${hasLabel ? `<div class="${clsLabel}" data-label></div>` : ''}
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
