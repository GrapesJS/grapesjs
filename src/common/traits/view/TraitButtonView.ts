import { isString } from 'underscore';
import { Model, $ } from '../..';
import Editor from '../../../editor';
import EditorModel from '../../../editor/model/Editor';
import Trait from '../model/Trait';
import TraitRoot from '../model/TraitRoot';
import TraitInputView, { TraitInputViewOpts } from './TraitInputView';

export interface TraitButtonViewOpts extends TraitInputViewOpts<'button'> {
  command: string | ((e: Editor, m: Model) => void);
  text?: string;
  full?: boolean;
}

export default class TraitButtonView extends TraitInputView<TraitRoot<any>> {
  type = 'button';
  command: string | ((e: Editor, m: Model) => void);
  text?: string;
  full?: boolean;
  events() {
    return {
      'click button': this.handleClick,
    };
  }

  constructor(em: EditorModel, opts: TraitButtonViewOpts) {
    super(em, opts);
    this.command = opts.command;
    this.text = opts.text;
    this.full = opts.full;
  }

  templateInput() {
    return '';
  }

  get inputValue(): any {
    return undefined;
  }

  set inputValue(value: any) {
    this.handleClick();
  }

  handleClick() {
    const { target, command, em } = this;
    if (command) {
      if (isString(command)) {
        em.Commands.run(command);
      } else {
        command(em.Editor, target.model);
      }
    }
  }

  getInputEl() {
    const { ppfx, text, full } = this;
    const className = `${ppfx}btn`;
    const input: any = $(
      `<button type="button" class="${className}-prim${full ? ` ${className}--full` : ''}">${text}</button>`
    );
    return input.get(0);
  }
}
