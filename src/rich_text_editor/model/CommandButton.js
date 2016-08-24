define(['backbone'],
	function (Backbone) {
		return Backbone.Model.extend({

			defaults: {
				command: '',
				title: '',
				class: '',
				group: '',
        arguments: [],
			},

		});
});
