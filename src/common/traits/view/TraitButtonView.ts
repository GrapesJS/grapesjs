import { isString } from 'underscore';
import { Model, $ } from '../..';
import Editor from '../../../editor';
import EditorModel from '../../../editor/model/Editor';
import Trait from '../model/Trait';
import TraitView, { TraitViewOpts } from './TraitView';

export interface TraitButtonViewOpts<TModel> extends TraitViewOpts {
  command: string | ((e: Editor, m: TModel) => void);
  text?: string;
  full?: boolean;
}

export default class TraitButtonView<TModel extends Model> extends TraitView<Trait<TModel, any>> {
  type = 'button';
  command: string | ((e: Editor, m: TModel) => void);
  text?: string;
  full?: boolean;
  events() {
    return {
      'click button': this.handleClick,
    };
  }

  constructor(em: EditorModel, opts: TraitButtonViewOpts<TModel>) {
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
    const { model, command, em } = this;
    if (command) {
      if (isString(command)) {
        em.Commands.run(command);
      } else {
        command(em.Editor, model as any);
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
