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
			this.propTarget	 = {};
			_.extend(this.propTarget, Backbone.Events);

			this.listenTo( this.target ,'change:selectedComponent', this.targetUpdated);

		},

		/**
		 * Fired when target is updated
		 */
		targetUpdated: function() {
			var el = this.target.get('selectedComponent');
			var classes = el.get('classes');

			if(classes.length){
				var cssC = this.target.get('CssComposer');
				var valid = _.filter(classes.models, function(item){ return item.get('active'); });
				var iContainer = cssC.getRule(valid, 'status', 'mediaq');
				if(!iContainer){
					//console.log(valid);
					iContainer = cssC.newRule(valid, 'status', 'mediaq');
					//console.log(iContainer.get('selectors').models);
					this.propTarget.target = iContainer;
					this.propTarget.trigger('update');
				}
			}

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
					propTarget	: this.propTarget,
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
