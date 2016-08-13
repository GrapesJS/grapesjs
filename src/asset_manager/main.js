/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [remove](#remove)
 * * [store](#store)
 * * [load](#load)
 * * [render](#render)
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var assetManager = editor.AssetManager;
 * ```
 *
 * @module AssetManager
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.assets=[]] Default assets
 * @example
 * ...
 * assetManager: {
 *    assets: [
 *      {src:'path/to/image.png'},
 *      ...
 *    ],
 *    upload: 'http://dropbox/path', // set to false to disable it
 *    uploadText: 'Drop files here or click to upload',
 * }
 * ...
 */
define(function(require) {

	return function() {
		var c = {},
			Assets = require('./model/Assets'),
			AssetsView = require('./view/AssetsView'),
			FileUpload = require('./view/FileUploader'),
			assets, am, fu;

	  return {

	  	/**
	  	 * Name of the module
	  	 * @type {String}
	  	 * @private
	  	 */
	  	name: 'AssetManager',

	  	/**
	  	 * If public module
	  	 * @type {Boolean}
	  	 * @private
	  	 */
	  	public: true,

	  	/**
	  	 * Initialize module
	  	 * @param {Object} config Configurations
			 * @param {Array<Object>} [config.assets=[]] Default assets
			 * @example
			 * ...
			 * {
			 * 	assets: [
			 *  	{src:'path/to/image.png'},
			 *     ...
			 *  ],
			 *  upload: 'http://dropbox/path', // set to false to disable it
			 *  uploadText: 'Drop files here or click to upload',
			 * }
	  	 */
	  	init: function(config){
	  		c = config;
	  		var defaults = require('./config/config');

	  		for (var name in defaults) {
					if (!(name in c))
						c[name] = defaults[name];
				}

				var ppfx = c.pStylePrefix;
				if(ppfx)
					c.stylePrefix = ppfx + c.stylePrefix;

	  		assets = new Assets(c.assets);
				var obj = {
					collection: assets,
					config: c,
				};
				am = new AssetsView(obj);
	  		fu = new FileUpload(obj);
	  	},

	  	stm: c.stm,

			/**
			 * Add new asset/s to the collection. URLs are supposed to be unique
			 * @param {string|Object|Array<string>|Array<Object>} asset URL strings or an objects representing the resource.
			 * @return {this}
			 * @example
			 * // In case of strings, would be interpreted as images
			 * assetManager.add('http://img.jpg');
			 * assetManager.add(['http://img.jpg', './path/to/img.png']);
			 *
			 * // Using objects you could indicate the type and other meta informations
			 * assetManager.add({
			 * 	src: 'http://img.jpg',
			 * 	//type: 'image',	//image is default
			 * 	height: 300,
			 *	width: 200,
			 * });
			 * assetManager.add([{
			 * 	src: 'http://img.jpg',
			 * },{
			 * 	src: './path/to/img.png',
			 * }]);
			 */
			add: function(asset){
				return assets.add(asset);
			},

			/**
			 * Return the asset by URL
			 * @param  {string} src URL of the asset
			 * @return {Object} Object representing the asset
			 * @example
			 * var asset = assetManager.get('http://img.jpg');
			 */
			get: function(src){
				return assets.where({src: src})[0];
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
			 * @param  {string} src URL of the asset
			 * @return {this}
			 * @example
			 * assetManager.remove('http://img.jpg');
			 */
			remove: function(src){
				var asset = this.get(src);
				this.getAll().remove(asset);
				return this;
			},

			/**
			 * Store assets data to the selected storage
			 * @return {this}
			 */
			store: function(){
				if(!this.stm)
					return;
				this.stm.store({
					assets: JSON.stringify(this.getAll().toJSON())
				});
				return this;
			},

			/**
			 * Load data from the selected storage. The fetched data will be added to the collection
			 * @return {Object} Stored assets
			 */
			load: function(){
				var name = 'assets';
				if(!this.stm)
					return;
				var data = this.stm.load([name]);
				var assets = (JSON.parse(data[name]) || []).reverse();
				this.getAll().add(assets);
				return assets;
			},

			/**
			 * Render assets
			 * @param  {Boolean} f 	Force to render, otherwise cached version will be returned
			 * @return {HTMLElement}
			 */
			render: function(f){
				if(!this.rendered || f)
					this.rendered	= am.render().$el.add(fu.render().$el);
				return	this.rendered;
			},

			//-------

			/**
			 * Set new target
			 * @param	{Object}	m Model
			 *
			 * @return	void
			 * */
			setTarget: function(m){
				am.collection.target = m;
			},

			/**
			 * Set callback after asset was selected
			 * @param	{Object}	f Callback function
			 *
			 * @return	void
			 * */
			onSelect: function(f){
				am.collection.onSelect = f;
			},

		};
	};
});