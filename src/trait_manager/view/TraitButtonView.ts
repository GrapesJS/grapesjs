import { isString } from 'underscore';
import TraitView from './TraitView';

export default class TraitButtonView extends TraitView {
  get eventCapture(){return ['click button']};

  protected get templateInput() {
    return '';
  }

  protected onChange() {
    this.handleClick();
  }

  private handleClick() {
    const { model, em } = this;
    const command = model.get('command');

    if (command) {
      if (isString(command)) {
        em.get('Commands').run(command);
      } else {
        command(em.get('Editor'), model);
      }
    }
  }

  protected getInputEl() {
    const { model, ppfx } = this;
    if (!this.$input) {
      const { labelButton, text, full } = model.props();
      const label = labelButton || text;
      const className = `${ppfx}btn`;
      const input = $<HTMLInputElement>(
        `<button type="button" class="${className}-prim${full ? ` ${className}--full` : ''}">${label}</button>`
      );
      this.$input = input;
    }
    return this.$input.get(0) as HTMLInputElement;
  }
}
