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

	});
});
