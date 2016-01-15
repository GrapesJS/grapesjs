define(function() {
	/**
	 * @class 	GeneratorInterface
	 * */
	function GeneratorInterface() {}

	GeneratorInterface.prototype = {
		
		/**
		 * Get id
		 * 
		 * @return	{String}|{Integer}
		 * */
		getId	: function(){},
		
		/**
		 * Generate code from model
		 * @param	{Backbone.Model}	model
		 * 
		 * @return	{String}
		 * */
		build	: function(model){},
	};

	return GeneratorInterface;
});