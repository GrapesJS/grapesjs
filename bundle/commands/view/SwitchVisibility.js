define(function() {
		/**
		 * @class SwitchVisibility
		 * */
		return {
			
			run: function()
			{
				this.$canvas.addClass(this.pfx + 'dashed');
			},
			
			stop: function()
			{
				this.$canvas.removeClass(this.pfx + 'dashed');
			}
		};
	});