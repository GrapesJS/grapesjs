define(['backbone'],
	function (Backbone) {

		return Backbone.View.extend({

      events: {
        'mousedown': 'handleClick',
      },

      attributes: function () {
        return this.model.get('attributes');
      },

      initialize: function(opts) {
        this.editor = opts.config.editor;
			},

      handleClick: function() {
        var command = this.model.get('command');

        if (typeof command === 'function') {
          command(this.editor);
        }

        if (typeof command === 'string') {
          this.editor.runCommand(command);
        }
      },

      render: function () {
        var config = this.editor.getConfig();
        this.el.className += ' ' + config.stylePrefix + 'toolbar-item';
        return this;
      },

		});
});
