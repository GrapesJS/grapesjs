define(['backbone','./LayerView'],
	function (Backbone, LayerView) {
	/**
	 * @class LayersView
	 * */
	return Backbone.View.extend({

		initialize: function(o) {
			this.config = o.config || {};
			this.stackModel	= o.stackModel;
			this.preview = o.preview;
			this.pfx = this.config.stylePrefix || '';
			this.ppfx = this.config.pStylePrefix || '';
			this.className	= this.pfx + 'layers ' + this.ppfx + 'field';
			this.listenTo( this.collection, 'add', this.addTo);
			this.listenTo( this.collection, 'deselectAll', this.deselectAll );
			this.listenTo( this.collection, 'reset', this.render);

			var em = this.config.em || '';
			var utils = em ? em.get('Utils') : '';

			this.sorter = utils ? new utils.Sorter({
				container: this.el,
				containerSel: '.' + this.pfx + 'layers',
				itemSel: '.' + this.pfx + 'layer',
				pfx: this.config.pStylePrefix,
			}) : '';

			this.$el.data('collection', this.collection);
		},

		/**
		 * Add to collection
		 * @param Object Model
		 *
		 * @return Object
		 * */
		addTo: function(model){
			var i	= this.collection.indexOf(model);
			this.addToCollection(model, null, i);
		},

		/**
		 * Add new object to collection
		 * @param Object Model
		 * @param Object Fragment collection
		 * @param	{number} index Index of append
		 *
		 * @return Object Object created
		 * */
		addToCollection: function(model, fragmentEl, index){
			var fragment = fragmentEl || null;
			var viewObject = LayerView;

			if(typeof this.preview !== 'undefined'){
				model.set('preview', this.preview);
			}

			var view = new viewObject({
					model: model,
					stackModel: this.stackModel,
					config: this.config,
					sorter: this.sorter
			});
			var rendered	= view.render().el;

			if(fragment){
				fragment.appendChild( rendered );
			}else{
				if(typeof index != 'undefined'){
					var method	= 'before';
					// If the added model is the last of collection
					// need to change the logic of append
					if(this.$el.children().length == index){
						index--;
						method = 'after';
					}
					// In case the added is new in the collection index will be -1
					if(index < 0){
						this.$el.append(rendered);
					}else
						this.$el.children().eq(index)[method](rendered);
				}else
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

			if(this.sorter)
				this.sorter.plh = null;

			return this;
		}
	});
});
