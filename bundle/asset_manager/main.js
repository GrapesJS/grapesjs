define(function(require) {
	/**
	 * @class 	AssetManager
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	var AssetManager	= function(config)
	{
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
			
			render		: function(){
				if(!this.rendered)
					this.rendered	= this.am.render().$el.add(this.fu.render().$el);
				return	this.rendered;
			},
	};
	
	return AssetManager;
});