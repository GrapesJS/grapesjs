define(['backbone'],
	function (Backbone) {
		/**
		 * @class Asset
		 * */
		return Backbone.Model.extend({

			idAttribute: 'src',

			defaults: {
				type:	'',
				src:	'',
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
