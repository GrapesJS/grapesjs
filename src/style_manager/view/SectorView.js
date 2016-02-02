define(['backbone','./PropertiesView'],
	function (Backbone,PropertiesView) {
	/**
	 * @class SectorView
	 * */
	return Backbone.View.extend({

		events:{},

		initialize: function(o) {
			this.config 	= o.config;
			this.pfx 			= this.config.stylePrefix;
			this.target		= o.target || {};
			this.open 		= this.model.get('open');
			this.listenTo( this.model ,'change:open', this.updateOpen);
			this.events['click .' + this.pfx + 'title']	= 'toggle';
			this.delegateEvents();
		},

		/**
		 * Update visibility
		 */
		updateOpen: function()
		{
			if(this.model.get('open'))
				this.show();
			else
				this.hide();
		},

		/**
		 * Show the content of the sector
		 * */
		show : function()
		{
			this.$el.addClass(this.pfx + "open");
			this.$el.find('.' + this.pfx + 'properties').show();
		},

		/**
		 * Hide the content of the sector
		 * */
		hide : function()
		{
			this.$el.removeClass(this.pfx + "open");
			this.$el.find('.' + this.pfx + 'properties').hide();
		},

		/**
		 * Toggle visibility
		 * */
		toggle: function()
		{
			var v 	= this.model.get('open') ? 0 : 1;
			this.model.set('open', v);
		},

		render : function()
		{
			this.$el.html('<div class="' + this.pfx + 'title">'+this.model.get('name')+'</div>');
			this.renderProperties();
			this.$el.attr('class', this.pfx + 'sector no-select');
			this.updateOpen();
			return this;
		},

		renderProperties: function()
		{
			var objs = this.model.get('properties');

			if(objs){
				var view = new PropertiesView({
					collection	: objs,
					target			: this.target,
					config			: this.config,
				});
				this.$el.append(view.render().el);
			}
		},
	});
});
