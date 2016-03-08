define(['backbone', './Selectors'],
    function (Backbone, Selectors) {
    	/**
    	 * @class CssRule
    	 * */
    	return Backbone.Model.extend({

    		defaults: {
                // Css selectors
                selectors: {},
                // Css properties style
                style: {},
                // On which device width this rule should be rendered, eg. @media (max-width: 1000px)
                maxWidth: '',
                // State of the rule, eg: hover | pressed | focused
                state: '',
                // Indicates if the rule is stylable
                stylable: true,
    		},

            initialize: function(c, opt) {
                this.config   = c || {};
                this.slct = this.config.selectors || [];
                this.set('selectors', new Selectors(this.slct));
            },

    	});
});
