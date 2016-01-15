define(['backbone'],
	function(Backbone) {
		/** 
		 * @class Modal
		 * */
		return Backbone.Model.extend({
			
			defaults: {
				title 		: '',
				content		: '',
				open 		: false,
			}
		
        });
	});