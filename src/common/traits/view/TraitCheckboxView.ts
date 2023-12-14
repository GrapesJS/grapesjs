import { Model } from 'backbone';
import TraitView from './TraitView';

export default class TraitCheckboxView<TModel extends Model> extends TraitView<TModel, boolean> {
  type = 'checkbox';
  appendInput = false;

  templateInput() {
    const { ppfx, clsField } = this;
    return `<label class="${clsField}" data-input>
    <i class="${ppfx}chk-icon"></i>
  </label>`;
  }

  getInputElem() {
    const { input, $input } = this;
    return input || ($input && $input.get && $input.get(0)) || this.getElInput();
  }

  get inputValue(): boolean {
    const el = this.getInputElem();
    return el?.checked ?? this.target.value;
  }

  set inputValue(value: boolean) {
    console.log('Text input value ' + value);
    const el = this.getInputElem();
    el && (el.checked = !!value);
  }
}
