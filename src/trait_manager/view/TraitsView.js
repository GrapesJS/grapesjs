define(['backbone', 'Abstract/view/DomainViews', './TraitView'],
	function (Backbone, DomainViews, TraitView) {

		return DomainViews.extend({

			itemView: TraitView,

			className: 'test-traits',

			initialize: function(o) {
				this.config = o.config || {};
				this.em = o.editor;
				this.pfx = this.config.stylePrefix || '';
				this.listenTo(this.em, 'change:selectedComponent', this.updatedCollection);
				/*
				if target not empty refresh
				 */
			},

			/**
			 * Update view collection
			 * @private
			 */
			updatedCollection: function() {
				var comp = this.em.get('selectedComponent');
				this.collection = comp.get('traits');
				this.render();
			},

			onChange: function() {
				//change model value
			},

			/**
			 * On change callback
			 * @private
			 */
			onValuesChange: function() {
				var m = this.model;
				var trg = m.target;
				var attrs = trg.get('attributes');
				attrs[m.get('name')] = m.get('value');
				trg.set('attributes', attrs);
			},

			/**
			 * Render label
			 * @private
			 */
			renderLabel: function() {
				this.$el.html(this.templateLabel({
					pfx		: this.pfx,
					ppfx	: this.ppfx,
					icon	: this.model.get('icon'),
					info	: this.model.get('info'),
					label	: this.model.get('name'),
				}));
			},

		});

});
