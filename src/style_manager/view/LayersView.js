define(['backbone','./LayerView'],
	function (Backbone, LayerView) {
	/**
	 * @class LayersView
	 * */
	return Backbone.View.extend({

		initialize: function(o) {
			this.config 	= o.config;
			this.stackModel	= o.stackModel;
			this.preview	= o.preview;
			this.pfx		= this.config.stylePrefix;
			this.className	= this.pfx + 'layers';
			this.listenTo( this.collection, 'add', this.addTo );
			this.listenTo( this.collection, 'deselectAll', this.deselectAll );
			this.listenTo( this.collection, 'reset', this.render );
		},

		/**
		 * Add to collection
		 * @param Object Model
		 *
		 * @return Object
		 * */
		addTo: function(model){
			this.addToCollection(model);
		},

		/**
		 * Add new object to collection
		 * @param Object Model
		 * @param Object Fragment collection
		 *
		 * @return Object Object created
		 * */
		addToCollection: function(model, fragmentEl){
			var fragment	= fragmentEl || null;
			var viewObject	= LayerView;

			if(typeof this.preview !== 'undefined'){
				model.set('preview', this.preview);
			}

			var view = new viewObject({
					model: model,
					stackModel: this.stackModel,
					config: this.config,
			});
			var rendered	= view.render().el;

			if(fragment){
				fragment.appendChild( rendered );
			}else{
				this.$el.append(rendered);
			}

			return rendered;
		},

		/**
		 * Deselect all
		 *
		 * @return void
		 * */
		deselectAll: function(){
			this.$el.find('.'+ this.pfx  +'layer').removeClass(this.pfx + 'active');
		},

		render: function() {
			var fragment = document.createDocumentFragment();
			this.$el.empty();

			this.collection.each(function(model){
				this.addToCollection(model, fragment);
			},this);

			this.$el.append(fragment);
			this.$el.attr('class', this.className);
			return this;
		}
	});
});
