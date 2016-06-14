define(['backbone'],
	function(Backbone) {

		return Backbone.Model.extend({

			defaults: {
				index: '',
				active: true,
				value: '',
				values: {},
				preview: false,
			}

    });
	});