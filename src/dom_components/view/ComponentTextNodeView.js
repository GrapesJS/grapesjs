define(['backbone'],
	function (Backbone) {

		return Backbone.View.extend({

			render: function() {
				this.el.innerHTML = this.model.get('content');
				return this;
			},

		});
});
