define(['backbone','./PanelView'],
	function (Backbone, PanelView) {
	/**
	 * @class ItemsView
	 * @private
	 * */
	return Backbone.View.extend({

		initialize: function(o) {
			this.opt = o || {};
			this.config = this.opt.config || {};
			this.pfx = this.config.stylePrefix || '';
			this.listenTo( this.collection, 'add', this.addTo );
			this.listenTo( this.collection, 'reset', this.render );
			this.className = this.pfx + 'panels';
		},

		/**
		 * Add to collection
		 * @param Object Model
		 *
		 * @return Object
		 * @private
		 * */
		addTo: function(model){
			this.addToCollection(model);
		},

		/**
		 * Add new object to collection
		 * @param	Object	Model
		 * @param	Object 	Fragment collection
		 * @param	integer	Index of append
		 *
		 * @return Object Object created
		 * @private
		 * */
		addToCollection: function(model, fragmentEl){
			var fragment = fragmentEl || null;
			var viewObject = PanelView;

			var view = new viewObject({
				model: model,
				config: this.config,
			});
			var rendered = view.render().el;

			if(fragment){
				fragment.appendChild(rendered);
			}else{
				this.$el.append(rendered);
			}

			return rendered;
		},

		render: function() {
			var fragment = document.createDocumentFragment();
			this.$el.empty();

			this.collection.each(function(model){
				this.addToCollection(model, fragment);
			}, this);

			this.$el.append(fragment);
			this.$el.attr('class', _.result(this, 'className'));
			return this;
		}
	});
});
