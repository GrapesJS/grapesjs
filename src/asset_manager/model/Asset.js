define(['backbone'], 
	function (Backbone) {
		/**
		 * @class Asset
		 * */
		return Backbone.Model.extend({ 
			
			defaults: {
				type:	'none',			//Type of the asset
				src:	'',				//Location
			},
			
			initialize: function(options) {
				this.options = options || {};
			},
			
			/**
			 * Get filename of the asset 
			 * 
			 * @return	{String}
			 * */
			getFilename: function(){
				return  this.get('src').split('/').pop(); 
			},
			
			/**
			 * Get extension of the asset 
			 * 
			 * @return	{String}
			 * */
			getExtension: function(){
				return  this.getFilename().split('.').pop(); 
			},
			
		});
});
