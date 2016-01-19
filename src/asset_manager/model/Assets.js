define(['backbone','./Asset'], 
	function (Backbone, Asset) {
		/**
		 * @class Assets
		 * */
		return Backbone.Collection.extend({ 
			
			model:	Asset,
			
		});
});
