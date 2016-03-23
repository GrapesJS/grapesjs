define(['backbone', './AssetView', './AssetImageView', './FileUploader'],
	function (Backbone, AssetView, AssetImageView, FileUploader) {
	/**
	 * @class AssetsView
	 * */
	return Backbone.View.extend({

		initialize: function(o) {
			this.options 	= o;
			this.config		= o.config;
			this.pfx		= this.config.stylePrefix;
			this.listenTo( this.collection, 'add', this.addToAsset );
			this.listenTo( this.collection, 'deselectAll', this.deselectAll );
			this.className	= this.pfx + 'assets';

			// Check if storage is required and if Storage Manager is available
			if(this.config.stm && this.config.storageType !== ''){
				var type		= this.config.storageType;
				this.provider	= this.config.stm.getProvider(type);
				this.storeName	= this.config.storageName ? this.config.storageName : this.className;
				if(this.provider){
					// Create new instance of provider
					this.storagePrv	= this.provider.clone().set(this.config);
					this.collection.reset();
					this.collection.add(this.load());
					if(this.config.storeOnChange){
						var ev	= 'remove' + (this.config.storeAfterUpload ? ' add' : '');
						this.listenTo(this.collection, ev, this.store);
					}
				}
			}
		},

		/**
		 * Store collection
		 *
		 * @return void
		 * */
		store: function(){
			if(this.storagePrv)
				this.storagePrv.store(this.storeName, JSON.stringify(this.collection.toJSON()) );
		},

		/**
		 * Load collection
		 *
		 * @return 	{Object}
		 * */
		load: function(){
			var result	= null;
			if(this.storagePrv)
				result = this.storagePrv.load(this.storeName);
			if(typeof result !== 'object'){
				try{
					result	= JSON.parse(result);
				}catch(err){
					console.warn(err);
				}
			}
			return result;
		},

		/**
		 * Add asset to collection
		 * */
		addToAsset: function(model){
			this.addAsset(model);
		},

		/**
		 * Add new asset to collection
		 * @param Object Model
		 * @param Object Fragment collection
		 *
		 * @return Object Object created
		 * */
		addAsset: function(model, fragmentEl){
			var fragment	= fragmentEl || null;
			var viewObject	= AssetView;

			if(model.get('type').indexOf("image") > -1)
				viewObject	= AssetImageView;

			var view 		= new viewObject({
				model	: model,
				config	: this.config,
			});
			var rendered	= view.render().el;

			if(fragment){
				fragment.appendChild( rendered );
			}else{
				this.$el.prepend(rendered);
			}

			return rendered;
		},

		/**
		 * Deselect all assets
		 *
		 * @return void
		 * */
		deselectAll: function(){
			this.$el.find('.' + this.pfx + 'highlight').removeClass(this.pfx + 'highlight');
		},

		render: function() {
			var fragment = document.createDocumentFragment();
			this.$el.empty();

			this.collection.each(function(model){
				this.addAsset(model, fragment);
			},this);

			this.$el.append(fragment);
			this.$el.attr('class', this.className);

			return this;
		}
	});
});
