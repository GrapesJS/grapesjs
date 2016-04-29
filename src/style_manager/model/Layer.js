define(['backbone'],
	function(Backbone) {

		return Backbone.Model.extend({

			defaults: {
				name 	: '',
				active	: true,
				value 	: '',
				preview	: false,
			}

    });
	});