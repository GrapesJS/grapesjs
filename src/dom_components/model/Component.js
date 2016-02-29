define(['backbone','./Components', 'ClassManager/model/ClassTags'],
	function (Backbone, Components, ClassTags) {
		/**
		 * @class Component
		 * */
		return Backbone.Model.extend({

			defaults: {
				tagName			: 'div',
				type				: '',
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
				style				: {},
				attributes	: {},
			},

			initialize: function(o, opt) {
				this.sm = opt ? opt.sm || {} : {};
				this.config 	= o || {};
				this.defaultC = this.config.components || [];
				this.defaultCl = this.normalizeClasses(this.config.classes || []);
				this.components	= new Components(this.defaultC, opt);
				this.set('components', this.components);
				this.set('classes', new ClassTags(this.defaultCl));
			},

			/**
			 * Normalize input classes from array to array of objects
			 * @param {Array} arr
			 *
			 * @return {Array}
			 */
			normalizeClasses: function(arr){
				var res = [];

				if(!this.sm.get)
					return;

				var clm = this.sm.get('ClassManager');
				if(!clm)
					return;

				arr.forEach(function(val){
					var name = '';

					if(typeof val === 'string')
						name = val;
					else
						name = val.name;

					var model = clm.addClass(name);
					res.push(model);
				});
				return res;
			},

			/**
			 * Override original clone method
			 */
	    clone: function()
	    {
	    	var attr = _.clone(this.attributes),
	    			comp = this.get('components'),
	    			cls = this.get('classes');
	    	attr.components = [];
	    	attr.classes 	= [];
	    	if(comp.length){
					comp.each(function(md,i){
							attr.components[i]	= md.clone();
					});
	    	}
	    	if(cls.length){
					cls.each(function(md,i){
							attr.classes[i]	= md.clone();
					});
	    	}
	      return new this.constructor(attr);
	    },

			/**
			 * Get name of the component
			 *
			 * @return {String}
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
