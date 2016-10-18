define([ 'backbone','./Panel'],
	function (Backbone, Panel) {

		return Backbone.Collection.extend({

			model: Panel,

		});
});
