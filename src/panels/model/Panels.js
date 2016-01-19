define([ 'backbone','./Panel'], 
	function (Backbone, Panel) {
		/**
		 * @class Panels
		 * */
		return Backbone.Collection.extend({
			
			model: Panel,
			
		});
});
