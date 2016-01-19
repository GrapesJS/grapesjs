define(['./Component'], 
	function (Component) {
		/**
		 * @class ComponentText
		 * */
		return Component.extend({ 
			
			defaults: _.extend({}, Component.prototype.defaults, {
					content 		: '',
					droppable		: false,
			}),
			
		});
});
