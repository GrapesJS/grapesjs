define(['./Component'],
	function (Component) {

		return Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
					tagName: 'a',
					droppable: false,
					traits: ['title', 'href', 'target'],
			}),

		});
});
