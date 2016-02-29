define(function(require) {
	/**
	 * @class 	Components
	 * @param 	{Object} Configurations
	 *
	 * @return	{Object}
 	 * */
	function Components(config)
	{
		var c					= config || {},
			defaults			= require('./config/config'),
			Component			= require('./model/Component'),
			ComponentText		= require('./model/ComponentText'),
			ComponentImage		= require('./model/ComponentImage'),
			ComponentView		= require('./view/ComponentView'),
			ComponentImageView	= require('./view/ComponentImageView'),
			ComponentTextView	= require('./view/ComponentTextView');

	  // Set default options
		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}

		if(!c.wrapper.attributes)
			c.wrapper.attributes 	= {};
		c.wrapper.attributes.id		= 'wrapper';

		// If there is no components try to append defaults
		if(!c.wrapper.components.length && c.defaults.length){
			c.wrapper.components = c.defaults;
		}

		if(!c.wrapper.style)
			c.wrapper.style 		= {};

		c.wrapper.style.position	= 'relative';
		this.component		= new Component(c.wrapper, { sm: c.em });

		var obj				= {
			model: this.component,
			config: c,
		};

		this.c = c;
	  this.ComponentView 	= new ComponentView(obj);
	}

	Components.prototype	= {

			/**
			 * Returns main wrapper which will contain all new components
			 *
			 * @return {Object}
			 */
			getComponent	: function(){
				return this.component;
			},

			/**
			 * Returns main wrapper which will contain all new components
			 *
			 * @return {Object}
			 */
			getWrapper: function(){
				return this.getComponent();
			},

			/**
			 * Returns children from the wrapper
			 *
			 * @return {Object}
			 */
			getComponents: function(){
				return this.getWrapper().get('components');
			},

			/**
			 * Render and returns wrapper
			 *
			 * @return {Object}
			 */
			render		: function(){
				return this.ComponentView.render().el;
			},
	};

	return Components;
});