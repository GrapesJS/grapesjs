import { Model } from '../..';
import TraitView from './TraitView';

export default class TraitTextView<TModel extends Model> extends TraitView<TModel, string> {
  protected type: string = 'text';

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
}
