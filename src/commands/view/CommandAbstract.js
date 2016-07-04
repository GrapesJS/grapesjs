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
				this.ppfx					= this.config.pStylePrefix;
				this.hoverClass		= this.pfx + 'hover';
				this.badgeClass		= this.pfx + 'badge';
				this.plhClass			= this.pfx + 'placeholder';
				this.freezClass		= this.ppfx + 'freezed';

				if(this.editorModel.get)
					this.setElement(this.editorModel.get('$editor').find('#'+this.canvasId));

				//TODO refactor
				var fbody = this.editorModel.Canvas.getBody();
				this.setElement(fbody);

				this.$canvas			= this.$el;
				this.$wrapper			= this.$canvas.find('#'+this.wrapperId);

				//TODO refactor
				this.$wrapper			= $(fbody.querySelector('#wrapper'));

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
			run: function(em, sender) {},

			/**
			 * Method that stop command
			 * @param	{Object}	em Editor model
			 * @param	{Object}	sender	Button sender
			 * @private
			 * */
			stop: function(em, sender) {}

		});
	});