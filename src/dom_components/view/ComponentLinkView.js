define(['backbone', './ComponentView'],
	function (Backbone, ComponentView) {

	return ComponentView.extend({

		events: {
      'click': 'onClick',
		},

    onClick: function(e) {
      e.preventDefault();
    },

	});
});
