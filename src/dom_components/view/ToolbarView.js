define(['backbone', 'Abstract/view/DomainViews', './ToolbarButtonView'],
	function (Backbone, DomainViews, ToolbarButtonView) {

		return DomainViews.extend({

			itemView: ToolbarButtonView,

			initialize: function(opts) {
				this.config = {editor: opts.editor || ''};
				this.listenTo(this.collection, 'reset', this.render);
			},

		});

});
