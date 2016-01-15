define(['backbone'],
	function(Backbone) {
		/** 
		 * @class Layer
		 * */
		return Backbone.Model.extend({
			
			defaults: {
				name 	: '', 			
				active	: true,		
				value 	: '',
				preview	: false,
			}
		
        });
	});