define(['backbone'],
	function(Backbone){
		/**
		 * @class Canvas
		 * */
		return Backbone.Model.extend({
			
			defaults :{
				wrapper		: '',
				rulers		: false,
			},
		
		});
	});
