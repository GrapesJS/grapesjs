define([ 'backbone', 'require'],
	function (Backbone, require) {
		/**
		 * @class Components
		 * */

		return Backbone.Collection.extend({

			initialize: function(models, opt){

				this.model	= function(attrs, options) {
					var model;

					if(!options.sm && opt && opt.sm)
						options.sm = opt.sm;

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

		});
});
