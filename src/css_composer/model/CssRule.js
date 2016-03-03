define(['backbone', './Selectors'],
	function (Backbone, Selectors) {
		/**
		 * @class CssRule
		 * */
		return Backbone.Model.extend({

			defaults: {
        selectors: {},
        style: {},
        stylable: true,
        state: '',
			},

      initialize: function(c, opt) {
        this.config   = c || {};
        this.slct = this.config.selectors || [];
        this.set('selectors', new Selectors(this.slct));
      },

		});
});
