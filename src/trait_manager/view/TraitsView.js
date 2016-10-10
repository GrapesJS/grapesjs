define(['backbone', 'Abstract/view/DomainViews', './TraitView'],
	function (Backbone, DomainViews, TraitView) {

		return DomainViews.extend({

			itemView: TraitView,

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
