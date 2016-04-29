define(['backbone', './Properties'],
	function(Backbone, Properties) {

		return Backbone.Model.extend({

			defaults: {
				id: '',
				name: '',
				open: true,
				properties : [],
			},

      initialize: function(opts) {
        var o = opts || {};
        var props = o.properties || this.get('properties');
        this.set('properties', new Properties(props));
      },

    });
});