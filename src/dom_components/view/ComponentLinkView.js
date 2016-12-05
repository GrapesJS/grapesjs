define(['backbone', './ComponentTextView'],
	function (Backbone, ComponentView) {

	return ComponentView.extend({

		events: {
      'click': 'onClick',
			'dblclick': 'enableEditing',
		},

    onClick: function(e) {
      e.preventDefault();
    },

		render: function() {
			ComponentView.prototype.render.apply(this, arguments);

			// Avoid strange behaviours while try to drag
			//this.$el.attr('onmousedown', 'return false');
			return this;
		},

	});
});
