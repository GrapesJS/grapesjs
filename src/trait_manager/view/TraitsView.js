define(['backbone', 'Abstract/view/DomainViews', './TraitView', './TraitSelectView', './TraitCheckboxView'],
	function (Backbone, DomainViews, TraitView, TraitSelectView, TraitCheckboxView) {

		return DomainViews.extend({

			itemView: TraitView,

			itemsView: {
				'text': TraitView,
				'select': TraitSelectView,
				'checkbox': TraitCheckboxView,
			},

			initialize: function(o) {
				this.config = o.config || {};
				this.em = o.editor;
				this.pfx = this.config.stylePrefix || '';
				this.className = this.pfx + 'traits';
				this.listenTo(this.em, 'change:selectedComponent', this.updatedCollection);
				this.updatedCollection();
			},

			/**
			 * Update view collection
			 * @private
			 */
			updatedCollection: function() {
				var comp = this.em.get('selectedComponent');
				if(comp){
					this.collection = comp.get('traits');
					this.render();
					this.el.className = this.className;
				}
			},

		});

});
