define(['backbone','./CommandButtonView'],
	function (Backbone, CommandButtonView) {
	return Backbone.View.extend({

		attributes : {
			'data-role':	'editor-toolbar',
		},

		initialize: function(o){
			this.config = o.config || {};
			this.id = this.config.stylePrefix + this.config.toolbarId;
			this.$el.data('helper', 1);
		},

		render: function() {
			var fragment = document.createDocumentFragment();
			this.$el.empty();

			this.collection.each(function(item){
				var view = new CommandButtonView({
					model: item,
					config: this.config,
					attributes: {
						'title': item.get('title'),
						'data-edit': item.get('command'),
					},
				});
				fragment.appendChild(view.render().el);
			},this);
			this.$el.append(fragment);
			this.$el.attr('id',  _.result( this, 'id' ) );
			return this;
		}

	});
});
