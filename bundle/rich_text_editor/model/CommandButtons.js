define([ 'backbone','./CommandButton'], 
	function (Backbone, CommandButton) {
		/**
		 * @class CommandButtons
		 * */
		return Backbone.Collection.extend({
			
			model: CommandButton,
			
		});
});
