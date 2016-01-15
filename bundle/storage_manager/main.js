define(function(require) {
	/**
	 * @class 	StorageManager
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	function StorageManager(config)
	{
		var c					= config || {},
			defaults			= require('./config/config'),
			LocalStorage		= require('./model/LocalStorage'),
			RemoteStorage		= require('./model/RemoteStorage'),
			StorageInterface	= require('./model/StorageInterface');
		
		for (var name in defaults){
			if (!(name in c))
				c[name] = defaults[name];
		}
		
		this.providers			= {};
		this.defaultProviders	= {};
		this.autosave			= c.autosave;
		this.currentProvider	= c.storageType || null;
		this.changesBeforeSave	= c.changesBeforeSave;
		this.si					= new StorageInterface();
		
		var Local				= new LocalStorage(c.localStorage),
			Remote				= new RemoteStorage(c.remoteStorage);
		
		this.defaultProviders[Local.getId()]	= Local;
		this.defaultProviders[Remote.getId()]	= Remote;
	}
	
	StorageManager.prototype	= {
			
			/**
			 * Check if autosave enabled
			 * 
			 * @return	boolean
			 * */
			isAutosave	: function(){
				return this.autosave;
			},
			
			/**
			 * Set autosave
			 * @param	{Mixed}	v	Value
			 * 
			 * @return	this
			 * */
			setAutosave	: function(v){
				this.autosave	= v;
				return this;
			},
			
			/**
			 * Returns value of changes required before save
			 * 
			 * @return	{Integer}
			 * */
			getChangesBeforeSave	: function(){
				return this.changesBeforeSave;
			},
			
			/**
			 * Set changesBeforeSave value
			 * @param	{Mixed}	v	Value
			 * 
			 * @return	this
			 * */
			setChangesBeforeSave	: function(v){
				this.changesBeforeSave	= v;
				return this;
			},
			
			/**
			 * Add new storage provider
			 * @param	{StorageInterface} provider
			 * 
			 * @return 	self
			 * */
			addProvider	: function(provider) {
				// Check interface implementation
				for (var method in this.si)
					if(!provider[method])
						console.warn("addProvider: method '"+ method +"' was not found inside '"+ provider.getId() +"' object");
					
				this.providers[provider.getId()] = provider;
				if(!this.currentProvider)
					this.currentProvider		 =	provider.getId();
				return this;
			},
			
			/**
			 * Returns storage provider
			 * @param	{Integer}	id	Storage provider ID
			 * 
			 * @return 	{StorageInterface}|null
			 * */
			getProvider	: function(id){
				var provider	= null;
				if(id && this.providers[id])
					provider	= this.providers[id];
				return provider;
			},
			
			/**
			 * Returns storage providers
			 * 
			 * @return 	{Array}
			 * */
			getProviders	: function(){
				return this.providers;
			},
			
			/**
			 * Get current provider
			 * 
			 * @return {StorageInterface}
			 * */
			getCurrentProvider		: function() {
				if(!this.currentProvider)
					this.loadDefaultProviders();
				return this.getProvider(this.currentProvider);
			},
			
			/**
			 * Set current provider
			 * @param	{Integer}	id	Storage provider ID
			 * 
			 * @return this
			 * */
			setCurrentProvider		: function(id) {
				this.currentProvider	= id;
				return this;
			},
			
			/**
			 * Load default providers
			 * 
			 * @return this
			 * */
			loadDefaultProviders	: function() {
				for (var id in this.defaultProviders) {
					this.addProvider(this.defaultProviders[id]);
				}
				return this;
			},
			
			/**
			 * Store resource
			 * @param	{String}	name	Name of the resource
			 * @param	{String}	value	Value of the resource
			 * 
			 * @return 	{Object}|void
			 * */
			store		: function(name, value){
				return	this.getCurrentProvider().store(name, value);
			},
			
			/**
			 * Load resource
			 * @param	{String}	name	Name of the resource
			 * 
			 * @return 	{Object}|void
			 * */
			load	: function(name){
				return	this.getCurrentProvider().load(name);
			},
			
			/**
			 * Remove resource
			 * @param	{String}	name	Name of the resource
			 * 
			 * @return 	{Object}|void
			 * */
			remove	: function(name){
				return	this.getCurrentProvider().remove(name);
			},
	};
	
	return StorageManager;
});