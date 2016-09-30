define(function(require) {

	return function(){
		var c = {},
		defaults = require('./config/config'),
		Traits = require('./model/Traits'),
		TraitsView = require('./view/TraitsView');
		var sectors, SectView;

	  return {

	  	/**
       * Name of the module
       * @type {String}
       * @private
       */
      name: 'TraitManager',

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

				sectors = new Traits(c.traits);
	  		SectView 	= new SectorsView({
					collection: sectors,
					target: c.em,
				  config: c,
				});
        return this;
      },

			/**
			 * Render sectors and properties
			 * @return	{HTMLElement}
			 * */
			render: function(){
				return SectView.render().el;
			},

		};
	};
});
