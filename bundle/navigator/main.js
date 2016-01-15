define(function(require) {
	/**
	 * @class Navigator
	 * @param {Object} Collection
	 * @param {Object} Configurations
 	 * */
	function Navigator(collection, c)
	{
		var config		= c,
			defaults	= require('./config/config'),
			ItemsView	= require('./view/ItemsView');

	    // Set default options
		for (var name in defaults) {
			if (!(name in config))
				config[name] = defaults[name];
		}
		
		var obj			= {
		    	collection	: collection,
		    	config		: config,
		};
		
		// Check if sort is required
		if(config.sortable){
			var ItemSort	= require('./view/ItemSort');
			obj.sorter		= new ItemSort({config : config});
		}
		
	    this.ItemsView	= new ItemsView(obj);
	}
	
	Navigator.prototype	= {
			render	: function(){
				return this.ItemsView.render().$el;
			},
	};
	
	return Navigator;
});