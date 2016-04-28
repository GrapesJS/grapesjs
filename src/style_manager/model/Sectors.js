define([ 'backbone','./Sector','./Properties'],
	function (Backbone,Sector, Properties) {

		return Backbone.Collection.extend({

			model: Sector,

			initialize: function(collection) {

				_.each(collection, function(obj){

					if(obj.properties instanceof Array){
						obj.properties = new Properties(obj.properties);
					}

				},this);

			},

		});
});
