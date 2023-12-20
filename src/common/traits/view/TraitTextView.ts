import EditorModel from '../../../editor/model/Editor';
import Trait from '../model/Trait';
import TraitInputView, { TraitInputViewOpts } from './TraitInputView';

export default class TraitTextView extends TraitInputView<Trait<string>> {
  protected type: string = 'text';

  constructor(em: EditorModel, opts?: TraitInputViewOpts<'text'>) {
    super(em, opts);
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
    const el = this.getInputElem();
    el && (el.value = value as any);
  }
}
