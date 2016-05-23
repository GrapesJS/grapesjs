/**
 * - [isAutosave](#isautosave)
 * - [setAutosave](#setautosave)
 * - [getStepsBeforeSave](#getstepsbeforesave)
 * - [setStepsBeforeSave](#setstepsbeforesave)
 * - [getStorages](#getstorages)
 * - [getCurrent](#getcurrent)
 * - [setCurrent](#setcurrent)
 * - [add](#add)
 * - [get](#get)
 * - [store](#store)
 * - [load](#load)
 *
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var storageManager = editor.get('StorageManager');
 * ```
 *
 * @module StorageManager
 * @param {Object} config Configurations
 * @param {Boolean} [config.autosave=true] Indicates if autosave mode is enabled, works in conjunction with stepsBeforeSave
 * @param {number} [config.stepsBeforeSave=1] If autosave enabled, indicates how many steps/changes are necessary
 * before autosave is triggered
 * @param {string} [config.storageType='local'] Default storage type. Available: 'local' | 'remote' | ''(do not store)
 * @example
 * ...
 * storageManager: {
 *  	autosave: false,
 *  	storageType: 'remote',
 * }
 * ...
 */
define(function(require) {

	var StorageManager = function(config) {

		var c = config || {},
		defaults = require('./config/config'),
		LocalStorage = require('./model/LocalStorage'),
		RemoteStorage = require('./model/RemoteStorage');

		for (var name in defaults){
			if (!(name in c))
				c[name] = defaults[name];
		}

		var storages = {};
		var defaultStorages = {};

		defaultStorages.remote	= new RemoteStorage(c);
		defaultStorages.local = new LocalStorage(c);
		c.currentStorage = c.storageType;

		return {

			/**
			 * Checks if autosave is enabled
			 * @return {Boolean}
			 * */
			isAutosave: function(){
				return !!c.autosave;
			},

			/**
			 * Set autosave value
			 * @param	{Boolean}	v
			 * @return {this}
			 * */
			setAutosave	: function(v){
				c.autosave = !!v;
				return this;
			},

			/**
			 * Returns number of steps required before trigger autosave
			 * @return {number}
			 * */
			getStepsBeforeSave: function(){
				return c.stepsBeforeSave;
			},

			/**
			 * Set steps required before trigger autosave
			 * @param	{number} v
			 * @return {this}
			 * */
			setStepsBeforeSave: function(v){
				c.stepsBeforeSave	= v;
				return this;
			},

			/**
			 * Add new storage
			 * @param {string} id Storage ID
			 * @param	{Object} storage Storage wrapper
			 * @param	{Function} storage.load Load method
			 * @param	{Function} storage.store Store method
			 * @return {this}
			 * @example
			 * storageManager.add('local2', {
			 * 	load: function(item){
			 * 		return localStorage.getItem(name);
			 * 	},
			 * 	store: function(item, value){
			 * 		localStorage.setItem(item, value);
			 * 	}
			 * });
			 * */
			add: function(id, storage) {
				storages[id] = storage;
				return this;
			},

			/**
			 * Returns storage by id
			 * @param {string} id Storage ID
			 * @return {Object|null}
			 * */
			get: function(id){
				return storages[id] || null;
			},

			/**
			 * Returns all storages
			 * @return 	{Array}
			 * */
			getStorages: function() {
				return storages;
			},

			/**
			 * Returns current storage type
			 * @return {string}
			 * */
			getCurrent: function() {
				return c.currentStorage;
			},

			/**
			 * Set current storage type
			 * @param {string} id Storage ID
			 * @return {this}
			 * */
			setCurrent: function(id) {
				c.currentStorage = id;
				return this;
			},

			/**
			 * Store resource in the current storage
			 * @param	{String} name Resource's name
			 * @param	{String} value Resource's value
			 * @return {Object|null}
			 * */
			store: function(name, value){
				var st = this.get(this.getCurrent());
				return st ? st.store(name, value) : null;
			},

			/**
			 * Load resource from the current storage
			 * @param	{string} name Resource's name
			 * @return {Object|null} Loaded resource
			 * */
			load: function(name){
				var st = this.get(this.getCurrent());
				return st ? st.load(name) : null;
			},

			/**
			 * Load default storages
			 * @return {this}
			 * @private
			 * */
			loadDefaultProviders	: function() {
				for (var id in defaultStorages)
					this.add(id, defaultStorages[id]);
				return this;
			},

		};

	};

	return StorageManager;

});