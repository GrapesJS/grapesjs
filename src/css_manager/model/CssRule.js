define(['backbone'],
	function (Backbone) {
		/**
		 * @class CssRule
		 * */
		return Backbone.Model.extend({

			defaults: {
        classes: {},
        style: {},
        stylable: true,
        state: '',
			},

		});
});
