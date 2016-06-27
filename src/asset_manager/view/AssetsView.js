define(['backbone', './AssetView', './AssetImageView', './FileUploader', 'text!./../template/assets.html'],
	function (Backbone, AssetView, AssetImageView, FileUploader, assetsTemplate) {
	/**
	 * @class AssetsView
	 * */
	return Backbone.View.extend({

		template: _.template(assetsTemplate),

		initialize: function(o) {
			this.options = o;
			this.config = o.config;
			this.pfx = this.config.stylePrefix || '';
			this.ppfx = this.config.pStylePrefix || '';
			this.listenTo( this.collection, 'add', this.addToAsset );
			this.listenTo( this.collection, 'deselectAll', this.deselectAll );
			this.className	= this.pfx + 'assets';

			// Check if storage is required and if Storage Manager is available
			if(this.config.stm && this.config.storageType !== ''){
				var type		= this.config.storageType;
				this.provider	= this.config.stm.get(type);
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

			this.events = {};
			this.events.submit = 'addFromStr';
			this.delegateEvents();
		},

		/**
		 * Add new asset to the collection via string
		 * @param {Event} e Event object
		 * @return {this}
		 */
		addFromStr: function(e){
			e.preventDefault();

			var input = this.getInputUrl();

			var url = input.value.trim();

			if(!url)
				return;

			this.collection.addImg(url, {at: 0});

			this.getAssetsEl().scrollTop = 0;
			input.value = '';
			return this;
		},

		/**
		 * Returns assets element
		 * @return {HTMLElement}
		 * @private
		 */
		getAssetsEl: function(){
			//if(!this.assets) // Not able to cache as after the rerender it losses the ref
			this.assets = this.el.querySelector('.' + this.pfx + 'assets');
			return this.assets;
		},

		/**
		 * Returns input url element
		 * @return {HTMLElement}
		 * @private
		 */
		getInputUrl: function(){
			if(!this.inputUrl || !this.inputUrl.value)
				this.inputUrl = this.el.querySelector('.'+this.pfx+'add-asset input');
			return this.inputUrl;
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
				var assetsEl = this.getAssetsEl();
				assetsEl.insertBefore(rendered, assetsEl.firstChild);
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

			this.$el.html(this.template({
				pfx:	this.pfx,
				ppfx: this.ppfx,
			}));

			this.$el.find('.'+this.pfx + 'assets').append(fragment);
			return this;
		}
	});
});
