define(['backbone'], function (Backbone) {

	return Backbone.View.extend({

		events:{
			'change': 'change'
		},

		initialize: function(o) {
		},

		/**
		 * On change callback
		 * @param {Object} el Test
		 * @private
		 */
		onChange: function(elView) {
			var m = this.model;
			var attrs = elView.model.get('attributes');
			attrs[m.get('name')] = m.get('value');
			elView.model.set('attributes', attrs);
		},

		render : function() {
			return this;
		},

	});

});
