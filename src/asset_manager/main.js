/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
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
 * @param {Array<Object>} [config.blocks=[]] Default blocks
 * @example
 * ...
 * assetManager: {
 *    assets: [
 *      {src:'path/to/image.png'},
 *      ...
 *    ],
 * }
 * ...
 */
define(function(require) {

	return function(config) {
		var c = config || {},
			defaults = require('./config/config'),
			Assets = require('./model/Assets'),
			AssetsView = require('./view/AssetsView'),
			FileUpload = require('./view/FileUploader');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}

		var assets = new Assets(c.assets);
		var obj = {
			collection: assets,
			config: c,
		};

	  var am = new AssetsView(obj);
	  var fu = new FileUpload(obj);

	  return {
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
				return	assets;
			},

			/**
			 * Set new target
			 * @param	{Object}	m Model
			 *
			 * @return	void
			 * */
			setTarget	: function(m){
				am.collection.target = m;
			},

			/**
			 * Set callback after asset was selected
			 * @param	{Object}	f Callback function
			 *
			 * @return	void
			 * */
			onSelect	: function(f){
				am.collection.onSelect = f;
			},

			/**
			 * Render
			 * @param  {Boolean} f 	Force to render
			 */
			render		: function(f){
				if(!this.rendered || f)
					this.rendered	= am.render().$el.add(fu.render().$el);
				return	this.rendered;
			}
		};
	};
});