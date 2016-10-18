define(function(require) {

	return function(){
		var c = {},
		defaults = require('./config/config'),
		Traits = require('./model/Traits'),
		TraitsView = require('./view/TraitsView');
		var TraitsViewer;

	  return {

			TraitsView: TraitsView,

	  	/**
       * Name of the module
       * @type {String}
       * @private
       */
      name: 'TraitManager',

			/**
			 * Get configuration object
			 * @return {Object}
			 * @private
			 */
			getConfig: function(){
        return c;
      },

      /**
       * Initialize module. Automatically called with a new instance of the editor
       * @param {Object} config Configurations
       */
      init: function(config) {
        c = config || {};
        for (var name in defaults) {
					if (!(name in c))
						c[name] = defaults[name];
				}

				var ppfx = c.pStylePrefix;
				if(ppfx)
					c.stylePrefix = ppfx + c.stylePrefix;
	  		TraitsViewer = new TraitsView({
					collection: [],
					editor: c.em,
				  config: c,
				});
        return this;
      },

			/**
			 *
			 * Get Traits viewer
			 * @private
			 */
			getTraitsViewer: function() {
				return TraitsViewer;
			},

		};
	};
});
