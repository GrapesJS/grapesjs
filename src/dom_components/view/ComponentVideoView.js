define(['backbone', './ComponentView'],
	function (Backbone, ComponentView) {

	return ComponentView.extend({

		tagName: 'video',

		events: {},

		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			console.log('Video view loaded');
		},

	});
});
