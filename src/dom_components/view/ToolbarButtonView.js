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
    var config = this.editor.getConfig();
    this.el.className += ' ' + config.stylePrefix + 'toolbar-item';
    return this;
  }
});
