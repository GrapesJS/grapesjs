define(function(require) {

	var AssetManager	= function(config) {
		var c			= config || {},
			defaults	= require('./config/config'),
			Assets		= require('./model/Assets'),
			AssetsView	= require('./view/AssetsView'),
			FileUpload	= require('./view/FileUploader');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}

		this.assets		= new Assets(c.assets);
		var obj				= {
				collection	: this.assets,
		    	config		: c,
		};

	  this.am 		= new AssetsView(obj);
	  this.fu 		= new FileUpload(obj);
	};

	AssetManager.prototype	= {

			/**
			 * Add new asset/s to the collection. URLs are supposed to be unique
			 * @param {string|Object|Array<string>|Array<Object>} assets URL strings or an objects representing the resource.
			 * @return {this}
			 * @example
			 * // In case of strings, would be interpreted as images
			 * assetManager.add('http://img.jpg');
			 * assetManager.add(['http://img.jpg', './path/to/img.png']);
			 *
			 * // Using objects you could indicate the type and other meta informations
			 * assetManager.add({
			 * 	src: 'http://img.jpg',
			 * 	type: 'image',
			 * 	height: 300,
			 *	width: 200,
			 * });
			 * assetManager.add([{
			 * 	src: 'http://img.jpg',
			 * 	type: 'image',
			 * },{
			 * 	src: './path/to/img.png',
			 * 	type: 'image',
			 * }]);
			 */
			add: function(assets){
				return this;
			},

			/**
			 * Return the asset by URL
			 * @param  {string} id URL of the asset
			 * @return {Object} Object representing the asset
			 * @example
			 * var asset = assetManager.get('http://img.jpg');
			 */
			get: function(id){
				return {};
			},

			/**
			 * Return all assets
			 * @return {Collection}
			 */
			getAll: function(){
				return assets;
			},

			/**
			 * Remove asset by URL
			 * @param  {string} id URL of the asset
			 * @return {this}
			 * @example
			 * assetManager.remove('http://img.jpg');
			 */
			remove: function(id){
				return this;
			},

			/**
			 * Store data from the selected storage
			 * @return {[type]} [description]
			 */
			store: function(){

			},

			/**
			 * Load data from the selected storage
			 * @return {[type]} [description]
			 */
			load: function(){

			},

			//-------

			/**
			 * Get collection of assets
			 *
			 * @return	{Object}
			 * */
			getAssets	: function(){
				return	this.assets;
			},

			/**
			 * Set new target
			 * @param	{Object}	m Model
			 *
			 * @return	void
			 * */
			setTarget	: function(m){
				this.am.collection.target = m;
			},

			/**
			 * Set callback after asset was selected
			 * @param	{Object}	f Callback function
			 *
			 * @return	void
			 * */
			onSelect	: function(f){
				this.am.collection.onSelect = f;
			},

			/**
			 * Render
			 * @param  {Boolean} f 	Force to render
			 */
			render		: function(f){
				if(!this.rendered || f)
					this.rendered	= this.am.render().$el.add(this.fu.render().$el);
				return	this.rendered;
			},
	};

	return AssetManager;
});