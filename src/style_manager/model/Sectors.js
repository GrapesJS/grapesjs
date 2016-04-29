define([ 'backbone', './Sector'],
	function (Backbone, Sector) {

		return Backbone.Collection.extend({

			model: Sector,

		});
});
