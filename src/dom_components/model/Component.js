define(['backbone','./Components', 'SelectorManager/model/Selectors', 'TraitManager/model/Traits'],
	function (Backbone, Components, Selectors, Traits) {

		return Backbone.Model.extend({

			defaults: {
				tagName: 'div',
				type: '',
				editable: false,

				// True if the component is removable from the canvas
				removable: true,

				// Indicates if it's possible to drag the component inside other
				// Tip: Indicate an array of selectors where it could be dropped inside
				draggable: true,

				// Indicates if it's possible to drop other components inside
				// Tip: Indicate an array of selectors which could be dropped inside
				droppable: true,

				// Set false if don't want to see the badge (with the name) over the component
				badgable: true,

				// True if it's possible to style it
				// Tip:  Indicate an array of css properties is possible to style
				stylable: true,

				// True if it's possible to clone the component
				copyable: true,

				// TODO
				mirror: '',

				void: false,
				state: '',
				status: '',
				previousModel: '',
				content: '',
				style: {},
				attributes: {},
				classes: '',
				traits: ['id', 'title'],
				toolbar: [{
					attributes: {class: 'fa fa-arrows'},
					command: 'tlb-move',
				},{
					attributes: {class: 'fa fa-clone'},
					command: 'tlb-clone',
				},{
					attributes: {class: 'fa fa-trash-o'},
					command: 'tlb-delete',
				}],
			},

			initialize: function(o, opt) {
				// Check void elements
				if(opt && opt.config && opt.config.voidElements.indexOf(this.get('tagName')) >= 0)
					this.set('void', true);

				this.sm = opt ? opt.sm || {} : {};
				this.config 	= o || {};
				this.defaultC = this.config.components || [];
				this.defaultCl = this.normalizeClasses(this.get('classes') || this.config.classes || []);
				this.components	= new Components(this.defaultC, opt);
				this.components.parent = this;
				this.set('components', this.components);
				this.set('classes', new Selectors(this.defaultCl));
				var traits = new Traits();
				traits.setTarget(this);
				traits.add(this.get('traits'));
				this.set('traits', traits);
			},

			/**
			 * Load traits
			 * @param  {Array} traits
			 * @private
			 */
			loadTraits: function(traits) {
				var trt = new Traits();
				trt.setTarget(this);
				trt.add(traits);
				this.set('traits', trt);
			},

			/**
			 * Normalize input classes from array to array of objects
			 * @param {Array} arr
			 * @return {Array}
			 * @private
			 */
			normalizeClasses: function(arr) {
				var res = [];

				if(!this.sm.get)
					return;

				var clm = this.sm.get('SelectorManager');
				if(!clm)
					return;

				arr.forEach(function(val){
					var name = '';

					if(typeof val === 'string')
						name = val;
					else
						name = val.name;

					var model = clm.add(name);
					res.push(model);
				});
				return res;
			},

			/**
			 * Override original clone method
			 * @private
			 */
	    clone: function() {
	    	var attr = _.clone(this.attributes),
	    			comp = this.get('components'),
						traits = this.get('traits'),
	    			cls = this.get('classes');
	    	attr.components = [];
	    	attr.classes = [];
				attr.traits = [];
	    	if(comp.length){
					comp.each(function(md,i) {
						attr.components[i]	= md.clone();
					});
	    	}
				if(traits.length){
					traits.each(function(md, i) {
						attr.traits[i] = md.clone();
					});
	    	}
	    	if(cls.length){
					cls.each(function(md,i) {
						attr.classes[i]	= md.get('name');
					});
	    	}
	    	attr.status = '';
				attr.view = '';
	      return new this.constructor(attr, {sm: this.sm});
	    },

			/**
			 * Get name of the component
			 * @return {string}
			 * @private
			 * */
			getName: function() {
				if(!this.name){
					var id = this.cid.replace(/\D/g,''),
						type = this.get('type');
					var tag = this.get('tagName');
					tag = tag == 'div' ? 'box' : tag;
					tag = type ? type : tag;
					this.name 	= tag.charAt(0).toUpperCase() + tag.slice(1);
				}
				return this.name;
			},

			/**
			 * Return HTML string of the component
			 * @param {Object} opts Options
			 * @return {string} HTML string
			 * @private
			 */
			toHTML: function(opts) {
				var code = '';
				var m = this;
				var tag = m.get('tagName'),
				sTag = m.get('void'),
				attrId = '';
				// Build the string of attributes
				var strAttr = '';
				var attr = this.getAttrToHTML();
				for(var prop in attr){
					var val = attr[prop];
					strAttr += typeof val !== undefined && val !== '' ?
						' ' + prop + '="' + val + '"' : '';
				}
				// Build the string of classes
				var strCls = '';
				m.get('classes').each(function(m){
					strCls += ' ' + m.get('name');
				});
				strCls = strCls !== '' ? ' class="' + strCls.trim() + '"' : '';

				// If style is not empty I need an ID attached to the component
				// TODO: need to refactor in case of 'ID Trait'
				if(!_.isEmpty(m.get('style')))
 					attrId = ' id="' + m.cid + '" ';

				code += '<' + tag + strCls + attrId + strAttr + (sTag ? '/' : '') + '>' + m.get('content');

				m.get('components').each(function(m) {
					code += m.toHTML();
				});

				if(!sTag)
					code += '</'+tag+'>';

				return code;
			},

			/**
			 * Returns object of attributes for HTML
			 * @return {Object}
			 * @private
			 */
			getAttrToHTML: function() {
				var attr = this.get('attributes') || {};
				delete attr.style;
				return attr;
			}

		},{

			/**
			 * Detect if the passed element is a valid component.
			 * In case the element is valid an object abstracted
			 * from the element will be returned
			 * @param {HTMLElement}
			 * @return {Object}
			 * @private
			 */
			isComponent: function(el) {
				return {tagName: el.tagName ? el.tagName.toLowerCase() : ''};
			},

		});
});
