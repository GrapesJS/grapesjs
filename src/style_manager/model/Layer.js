define(['backbone'],
	function(Backbone) {

		return Backbone.Model.extend({

			defaults: {
				index: '',
				active: true,
				value: '',
				preview: false,
			}

    });
	});