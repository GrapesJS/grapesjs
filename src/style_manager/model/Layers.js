define([ 'backbone', './Layer'],
	function (Backbone, Layer) {

		return Backbone.Collection.extend({

			model: Layer,

		});
});
