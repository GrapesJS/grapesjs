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

			// The taget that will emit events for properties
			this.propTarget	 = {};
			_.extend(this.propTarget, Backbone.Events);
			this.listenTo( this.target, 'change:selectedComponent', this.targetUpdated);

		},

		/**
		 * Fired when target is updated
		 */
		targetUpdated: function() {
			var el = this.target.get('selectedComponent');

			if(!el)
				return;

			var classes = el.get('classes');
			var pt = this.propTarget;

			if(classes.length){
				var cssC = this.target.get('CssComposer');
				var valid = _.filter(classes.models, function(item){
					return item.get('active');
				});
				var iContainer = cssC.getRule(valid, 'status', 'mediaq');
				if(!iContainer){
					iContainer = cssC.newRule(valid, 'status', 'mediaq');
					// Hydrate styles from component element
					iContainer.set('style', el.get('style'));
					cssC.addRule(iContainer);
					el.set('style', {});
				}
				pt.model = iContainer;
				pt.trigger('update');
				return;
			}

			pt.model = el;
			pt.trigger('update');
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
