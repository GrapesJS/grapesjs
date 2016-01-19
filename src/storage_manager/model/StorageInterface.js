define(function() {
	/**
	 * @class 	StorageInterface
	 * */
	function StorageInterface() {}

	StorageInterface.prototype = {
			
		getId	: function() {},
			
		store	: function(name, value) {},
		
		load	: function(name) {},
		
		remove	: function(name) {},
	};

	return StorageInterface;
});