import { isString } from 'underscore';
import TraitView from './TraitView';

export default class TraitButtonView extends TraitView {
  templateInput() {
    return '';
  }

  onChange() {
    this.handleClick();
  }

  handleClick() {
    const { model, em } = this;
    const command = model.get('command');

    if (command) {
      if (isString(command)) {
        em.Commands.run(command);
      } else {
        command(em.Editor, model);
      }
    }
  }

  renderLabel() {
    if (this.model.get('label')) {
      TraitView.prototype.renderLabel.apply(this);
    }
  }

  getInputEl() {
    const { model, ppfx } = this;
    const { labelButton, text, full } = model.props();
    const label = labelButton || text;
    const className = `${ppfx}btn`;
    const input: any = `<button type="button" class="${className}-prim${
      full ? ` ${className}--full` : ''
    }">${label}</button>`;
    return input;
  }
}

// Fix #4388
TraitButtonView.prototype.eventCapture = ['click button'];
