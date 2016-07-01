define(['backbone'],
	function(Backbone){

		return Backbone.Model.extend({

			defaults :{
				wrapper: '',
				rulers: false,
			},

		});
	});
