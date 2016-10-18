define([ 'backbone', './Property'],
	function (Backbone, Property) {

		return Backbone.Collection.extend({

			model: Property,

		});
});
