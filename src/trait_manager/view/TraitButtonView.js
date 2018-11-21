import { isString, isObject } from 'underscore';
const TraitView = require('./TraitView');

module.exports = TraitView.extend({
  events: {
    'click button': 'handleClick'
  },

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
    if (!this.input) {
      const { model, ppfx } = this;
      const value = this.getModelValue();
      const label = model.get('labelButton') || '';
      const full = model.get('full');
      const className = `${ppfx}btn`;
      const input = `<button type="button" class="${className}-prim${
        full ? ` ${className}--full` : ''
      }">
        ${label}</button>`;
      this.input = input;
    }

    return this.input;
  },

  renderField() {
    if (!this.$input) {
      this.$el.append(this.getInputEl());
    }
  }
});
