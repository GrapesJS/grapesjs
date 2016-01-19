define([ 'backbone','./Command'], 
	function (Backbone, Command) {
		/**
		 * @class Commands
		 * */
		return Backbone.Collection.extend({
			
			model: Command,
			
		});
});
