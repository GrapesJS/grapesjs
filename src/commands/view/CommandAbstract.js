define(['backbone'],
	function(Backbone) {
		/**
		 * @class CommandAbstract
		 * @private
		 * */
		return Backbone.View.extend({

			/**
			 * Initialize method that can't be removed
			 * @param	{Object}	o Options
			 * @private
			 * */
			initialize: function(o) {
				this.config				= o || {};
				this.editorModel 	= this.em = this.config.em || {};
				this.canvasId			= this.config.canvasId 	|| '';
				this.wrapperId		= this.config.wrapperId 	|| 'wrapper';
				this.pfx					= this.config.stylePrefix;
				this.hoverClass		= this.pfx + 'hover';
				this.badgeClass		= this.pfx + 'badge';
				this.plhClass			= this.pfx + 'placeholder';
				if(this.editorModel.get)
					this.setElement(this.editorModel.get('$editor').find('#'+this.canvasId));
				this.$canvas			= this.$el;
				this.$wrapper			= this.$canvas.find('#'+this.wrapperId);
				this.init(this.config);
			},

			/**
			 * Callback triggered after initialize
			 * @param	{Object}	o 	Options
			 * @private
			 * */
			init: function(o){},

			/**
			 * Method that run command
			 * @param	{Object}	em 		Editor model
			 * @param	{Object}	sender	Button sender
			 * @private
			 * */
			run: function(em, sender) {
				console.warn("No run method found");
			},

			/**
			 * Method that stop command
			 * @param	{Object}	em Editor model
			 * @param	{Object}	sender	Button sender
			 * @private
			 * */
			stop: function(em, sender) {
				console.warn("No stop method found");
			}

		});
	});