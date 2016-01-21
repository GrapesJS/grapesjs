define(['backbone','./PropertiesView'],
	function (Backbone,PropertiesView) {
	/**
	 * @class SectorView
	 * */
	return Backbone.View.extend({

		events:{},

		initialize: function(o) {
			this.config 	= o.config;
			this.pfx 		= this.config.stylePrefix;
			this.target		= o.target || {};
			this.open 		= this.model.get('open');
			this.events['click .' + this.pfx + 'title']	= 'toggle';
			this.delegateEvents();
		},

		/**
		 * Show the content of the sector
		 * */
		show : function(){
			this.$el.addClass(this.pfx + "open");
			this.$el.find('.' + this.pfx + 'properties').show();
			this.open = true;
		},

		/**
		 * Hide the content of the sector
		 * */
		hide : function(){
			this.$el.removeClass(this.pfx + "open");
			this.$el.find('.' + this.pfx + 'properties').hide();
			this.open = false;
		},

		/**
		 * Toggle visibility of the content
		 * */
		toggle: function(){
			if(this.open)
				this.hide();
			else
				this.show();
		},

		render : function(){
			if(this.open)
				this.show();
			else
				this.hide();
			this.$el.html('<div class="' + this.pfx + 'title">'+this.model.get('name')+'</div>');
			this.renderProperties();
			this.$el.attr('class', this.pfx + 'sector no-select');
			return this;
		},

		renderProperties: function(){
			var objs = this.model.get('properties');

			if(objs){
				var view = new PropertiesView({
					collection	: objs,
					target		: this.target,
					config		: this.config,
				});
				this.$el.append(view.render().el);
			}
		},
	});
});
