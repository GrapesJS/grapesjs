define(function(require) {
	/**
	 * @class 	StyleManager
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	function StyleManager(config)
	{
		var c				= config || {},
			defaults		= require('./config/config'),
			Sectors			= require('./model/Sectors'),
			SectorsView		= require('./view/SectorsView');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}
		
		this.sectors		= new Sectors(c.sectors);
		var obj				= {
				collection	: this.sectors,
				target		: c.target,
		    	config		: c,
		};
		
	    this.SectorsView 	= new SectorsView(obj);
	}
	
	StyleManager.prototype	= {
			
			/**
			 * Get all sectors
			 * 
			 * @return	{Sectors}
			 * */
			getSectors	: function()
			{
				return this.sectors;
			},
			
			/**
			 * Get sector by id
			 * @param	{String}	id	Object id
			 * 
			 * @return	{Sector}|{null}
			 * */
			getSector	: function(id)
			{
				var res	= this.sectors.where({id: id});
				return res.length ? res[0] : null;
			},
			
			/**
			 * Add new Sector
			 * @param	{String}	id	Object id
			 * @param	{Object}	obj	Object data
			 * 
			 * @return	{Sector}
			 * */
			addSector	: function(id, obj)
			{
				if(!this.getSector(id)){
					obj.id	= id;
					return this.sectors.add(obj);
				}
			},
			
			/**
			 * Render sectors
			 * 
			 * @return	{String}
			 * */
			render		: function(){
				return this.SectorsView.render().$el;
			},
	};
	
	return StyleManager;
});