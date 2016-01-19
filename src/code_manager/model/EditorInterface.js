define(function() {
	/**
	 * @class 	EditorInterface
	 * */
	function EditorInterface() {}

	EditorInterface.prototype = {
		
		/**
		 * Get id
		 * 
		 * @return	{String}|{Integer}
		 * */
		getId	: function(){},
		
		/**
		 * Set content
		 * @param	{String}	str
		 * 
		 * */
		setContent	: function(str){},
		
		/**
		 * Init editor
		 * @param	{Object}	el	DOM element
		 * */
		init	: function(el){},
	};

	return EditorInterface;
});