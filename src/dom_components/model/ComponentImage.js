define(['./Component'], 
	function (Component) {
		/**
		 * @class ComponentImage
		 * */
		return Component.extend({ 
			
			defaults: _.extend({}, Component.prototype.defaults, {
					src 			: '',
					droppable		: false,
			}),
			
		});
});
