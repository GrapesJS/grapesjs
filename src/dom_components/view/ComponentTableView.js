define(['backbone', './ComponentView'],
	function (Backbone, ComponentView) {

	return ComponentView.extend({

		events: {},
		/*
		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			this.classEmpty = this.ppfx + 'plh-map';
		},
		*/
/*
		render: function() {
			ComponentView.prototype.render.apply(this, arguments);
			this.updateClasses();
			this.el.appendChild(this.getIframe());
			return this;
		},
*/
	});
});
