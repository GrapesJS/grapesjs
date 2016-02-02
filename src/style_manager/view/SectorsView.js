define(['backbone','./SectorView'],
	function (Backbone, SectorView) {
	/**
	 * @class sectorsView
	 * */
	return Backbone.View.extend({

		initialize: function(o) {
			this.config 	= o.config;
			this.pfx 		= this.config.stylePrefix;
			this.target		= o.target || {};
		},

		render: function() {
			var fragment = document.createDocumentFragment();

			this.collection.each(function(obj){
				var view = new SectorView({
					model				: obj,
					id					: this.pfx + obj.get('name').replace(' ','_').toLowerCase(),
					name				: obj.get('name'),
					properties	: obj.get('properties'),
					target			: this.target,
					config			: this.config,
				});
				fragment.appendChild(view.render().el);
			}, this);

			this.$el.attr('id', this.pfx + 'sectors');
			this.$el.append(fragment);
			return this;
		}
	});
});
