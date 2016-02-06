define(['backbone','./Components'],
	function (Backbone, Components) {
		/**
		 * @class Component
		 * */
		return Backbone.Model.extend({

			defaults: {
				tagName			: 'div',
				type			: '',
				editable		: false,
				removable		: true,
				movable			: true,
				droppable		: true,
				badgable		: true,
				stylable		: true,
				copyable		: true,
				status			: '',
				previousModel	: '',
				content			: '',
				style			: {},
				attributes		: {},
			},

			initialize: function(options) {
				this.defaultC = options.components || [];
				this.components	= new Components(this.defaultC);
				this.set('components', this.components);
			},

			/**
			 * Override original clone method
			 */
	    clone: function()
	    {
	    	var attr 					= _.clone(this.attributes),
	    			comp 					= this.get('components');
	    	attr.components 	= [];
	    	if(comp.length){
					comp.each(function(md,i){
							attr.components[i]	= md.clone();
					});
	    	}
	      return new this.constructor(attr);
	    },

			/**
			 * Get name of the component
			 *
			 * @return string
			 * */
			getName: function(){
				if(!this.name){
					var id		= this.cid.replace(/\D/g,''),
						type	= this.get('type');
					this.name 	= type.charAt(0).toUpperCase() + type.slice(1) + 'Box' + id;
				}
				return this.name;
			},

		});
});
