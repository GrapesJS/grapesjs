define([ 'backbone','./Layer'], 
	function (Backbone,Layer) {
		/** 
		 * @class Layers
		 * */
		return Backbone.Collection.extend({
			
			model: Layer,
			
		});
});
