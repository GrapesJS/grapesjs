import { isString } from 'underscore';
import TraitView from './TraitView';

export default TraitView.extend({
  events: {
    'click button': 'handleClick'
  },

  templateInput: '',

  handleClick() {
    const { model, em } = this;
    const command = model.get('command');

    if (command) {
      if (isString(command)) {
        em.get('Commands').run(command);
      } else {
        command(em.get('Editor'), model);
      }
    }
  },

  renderLabel() {
    if (this.model.get('label')) {
      TraitView.prototype.renderLabel.apply(this, arguments);
    }
  },

  getInputEl() {
    const { model, ppfx } = this;
    const { labelButton, text, full } = model.props();
    const label = labelButton || text;
    const className = `${ppfx}btn`;
    const input = `<button type="button" class="${className}-prim${
      full ? ` ${className}--full` : ''
    }">${label}</button>`;
    return input;
  }
});
