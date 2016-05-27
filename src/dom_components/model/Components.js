define([ 'backbone', 'require'],
	function (Backbone, require) {

		return Backbone.Collection.extend({

			initialize: function(models, opt){

				this.on('add', this.onAdd);

				this.config = opt && opt.config ? opt.config : null;

				// Inject editor
				if(opt && opt.sm)
					this.editor = opt.sm;

				this.model	= function(attrs, options) {
					var model;

					if(!options.sm && opt && opt.sm)
						options.sm = opt.sm;

					if(opt && opt.config)
						options.config = opt.config;

					switch(attrs.type){

						case 'text':
							if(!this.mComponentText)
					    		this.mComponentText		= require("./ComponentText");
							model	= new this.mComponentText(attrs, options);
							break;

						case 'image':
							if(!this.mComponentImage)
					    		this.mComponentImage	= require("./ComponentImage");
							model	= new this.mComponentImage(attrs, options);
							break;

						default:
							if(!this.mComponent)
					    		this.mComponent			= require("./Component");
							model	= new this.mComponent(attrs, options);

					}

					return	model;
				};

			},

			add: function(models, opt){
				if(typeof models === 'string')
					models = this.editor.Parser.parseHtml(models);

				return Backbone.Collection.prototype.add.apply(this, [models, opt]);
			},

			onAdd: function(model, c, opts){
				var style = model.get('style');

				if(!_.isEmpty(style) && this.editor){
					var newClass = this.editor.get('ClassManager').addClass(model.cid);
					model.get('classes').add(newClass);
					var rule = this.editor.get('CssComposer').newRule(newClass);
					rule.set('style', style);
				}
      },

		});
});
