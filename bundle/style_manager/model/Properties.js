define([ 'backbone','./Property'], 
	function (Backbone,Property) {
		/** 
		 * @class Properties
		 * */
		return Backbone.Collection.extend({
			
			model: Property,
			
		});
});
