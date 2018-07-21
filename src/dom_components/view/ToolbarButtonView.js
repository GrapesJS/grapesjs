var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  events() {
    return (
      this.model.get('events') || {
        mousedown: 'handleClick'
      }
    );
  },

  attributes() {
    return this.model.get('attributes');
  },

  initialize(opts) {
    this.editor = opts.config.editor;
  },

  handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.execCommand(event);
  },

  execCommand(event) {
    const opts = { event };
    const command = this.model.get('command');
    const editor = this.editor;

    if (typeof command === 'function') {
      command(editor, null, opts);
    }

    if (typeof command === 'string') {
      editor.runCommand(command, opts);
    }
  },

  render() {
    const { editor, $el, model } = this;
    const label = model.get('label');
    const pfx = editor.getConfig('stylePrefix');
    $el.addClass(`${pfx}toolbar-item`);
    label && $el.append(label);
    return this;
  }
});
