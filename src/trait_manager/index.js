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
			getConfig: function() {
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

			/**
			 * Add new trait type
			 * @param {string} name Type name
			 * @param {Object} methods Object representing the trait
			 */
			addType: function (name, trait) {
				var itemView = TraitsViewer.itemView;
				TraitsViewer.itemsView[name] = itemView.extend(trait);
			},

			/**
			 * Get trait type
			 * @param {string} name Type name
			 * @return {Object}
			 */
			getType: function (name) {
				return TraitsViewer.itemsView[name];
			},

		};
	};
});
