define(['backbone'],
	function(Backbone) {
		/**
		 * @class CommandAbstract
		 * */
		return Backbone.View.extend({

			/**
			 * Initialize method that can't be removed
			 * @param	{Object}	o Options
			 * */
			initialize: function(o) {
				this.config				= o;
				this.editorModel 	= this.em = o.em || {};
				this.canvasId			= o.canvasId 	|| '';
				this.wrapperId		= o.wrapperId 	|| 'wrapper';
				this.pfx					= o.stylePrefix;
				this.hoverClass		= this.pfx + 'hover';
				this.badgeClass		= this.pfx + 'badge';
				this.plhClass			= this.pfx + 'placeholder';
				this.setElement(this.editorModel.get('$editor').find('#'+this.canvasId));
				this.$canvas			= this.$el;
				this.$wrapper			= this.$canvas.find('#'+this.wrapperId);
				this.init(o);
			},

			/**
			 * Callback triggered after initialize
			 * @param	{Object}	o 	Options
			 * */
			init: function(o){},

			/**
			 * Method that run command
			 * @param	{Object}	em 		Editor model
			 * @param	{Object}	sender	Button sender
			 * */
			run: function(em, sender) {
				console.warn("No run method found");
			},

			/**
			 * Method that stop command
			 * @param	{Object}	em Editor model
			 * @param	{Object}	sender	Button sender
			 * */
			stop: function(em, sender) {
				console.warn("No stop method found");
			}

		});
	});