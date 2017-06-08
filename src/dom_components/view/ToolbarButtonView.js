var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  events: {
    'mousedown': 'handleClick',
  },

  attributes() {
    return this.model.get('attributes');
  },

  initialize(opts) {
    this.editor = opts.config.editor;
	},

  handleClick(event) {
    var opts = {event};
    var command = this.model.get('command');

    if (typeof command === 'function') {
      command(this.editor, null, opts);
    }

    if (typeof command === 'string') {
      this.editor.runCommand(command, opts);
    }
  },

  render() {
    var config = this.editor.getConfig();
    this.el.className += ' ' + config.stylePrefix + 'toolbar-item';
    return this;
  },

});
