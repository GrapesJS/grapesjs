import { isFunction, isString, isUndefined } from 'underscore';
import EditorModel from '../../../editor/model/Editor';
import { $ } from '../..';
import Trait from '../model/Trait';
import TraitInputView, { TraitInputViewOpts } from './TraitInputView';

export type SelectOption =
  | string
  | {
      name: string;
      value: string;
      style?: string;
    };

export interface TraitSelectViewOpts extends TraitInputViewOpts<'select'> {
  options: SelectOption[];
}

export default class TraitSelectView extends TraitInputView<Trait<string>> {
  protected type = 'select';
  options: SelectOption[] | ((em: EditorModel) => SelectOption[]);

  constructor(em: EditorModel, opts: TraitSelectViewOpts) {
    super(em, opts);
    this.options = opts.options;
  }

  getInputElem() {
    const { input, $input } = this;
    return input || ($input && $input.get && $input.get(0)) || this.getElInput();
  }

  get inputValue(): string {
    const el = this.getInputElem();
    return el?.value ?? this.target.value;
  }

  set inputValue(value: string) {
    console.log('Text input value ' + value);
    const el = this.getInputElem();
    el && (el.value = value as any);
  }

  templateInput() {
    const { ppfx, clsField } = this;
    return `<div class="${clsField}">
      <div data-input></div>
      <div class="${ppfx}sel-arrow">
        <div class="${ppfx}d-s-arrow"></div>
      </div>
    </div>`;
  }

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      const { name, options, em } = this;
      const values: string[] = [];
      let input = '<select>';

      const opts = isFunction(options) ? options(em) : options;
      console.log('setValueValOptions', opts);
      opts.forEach(el => {
        let attrs = '';
        let name, value, style;

        if (isString(el)) {
          name = el;
          value = el;
        } else {
          name = el.name || el.value;
          value = `${isUndefined(el.value) ? el.name : el.value}`.replace(/"/g, '&quot;');
          style = el.style ? el.style.replace(/"/g, '&quot;') : '';
          attrs += style ? ` style="${style}"` : '';
        }
        const resultName = em.t(`traitManager.traits.options.${name}.${value}`) || name;
        input += `<option value="${value}"${attrs}>${resultName}</option>`;
        values.push(value);
      });

      input += '</select>';
      this.$input = $(input);
      const val = this.target.value;
      const valResult = values.indexOf(val) >= 0 ? val : '';
      !isUndefined(valResult) && this.$input!.val(valResult);
    }

    return this.$input!.get(0);
  }
}
