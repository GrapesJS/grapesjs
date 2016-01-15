define(['backbone'],
	function(Backbone) {
		/** 
		 * @class Sector
		 * */
		return Backbone.Model.extend({
			
			defaults: {
				name : '', 			
				open: true,		
				properties : {},
			}
		
        });
	});