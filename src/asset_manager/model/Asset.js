define(['backbone'],
	function (Backbone) {
		return Backbone.Model.extend({

			idAttribute: 'src',

			defaults: {
				type:	'',
				src:	'',
			},

			/**
			 * Get filename of the asset
			 * @return	{string}
			 * @private
			 * */
			getFilename: function(){
				return  this.get('src').split('/').pop();
			},

			/**
			 * Get extension of the asset
			 * @return	{string}
			 * @private
			 * */
			getExtension: function(){
				return  this.getFilename().split('.').pop();
			},

		});
});
