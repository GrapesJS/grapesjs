define([ 'backbone','./CommandButton'],
	function (Backbone, CommandButton) {
		return Backbone.Collection.extend({

			model: CommandButton,

		});
});
