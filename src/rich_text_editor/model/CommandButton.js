define(['backbone'], 
	function (Backbone) {
		/**
		 * @class CommandButton
		 * */
		return Backbone.Model.extend({ 
			
			defaults: {
				command		: '',
				title		: '',
				class		: '',
				group		: '',
			},
			
		});
});
