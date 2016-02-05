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
			console.log('Set defaults');
			c.wrapper.components = c.defaults;
		}

		if(!c.wrapper.style)
			c.wrapper.style 		= {};
		c.wrapper.style.position	= 'relative';

		this.component		= new Component(c.wrapper);
		var obj				= {
				model	: this.component,
		    	config	: c,
		};

	    this.ComponentView 	= new ComponentView(obj);
	}

	Components.prototype	= {

			render		: function(){
				return this.ComponentView.render().$el;
			},

			getComponent	: function(){
				return this.component;
			},
	};

	return Components;
});