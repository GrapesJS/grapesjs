define(['backbone', './ComponentImageView'],
	function (Backbone, ComponentView) {

	return ComponentView.extend({

		events: {},

		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			//on width/height change update static url
			//zomm 1-22
		},

	});
});
