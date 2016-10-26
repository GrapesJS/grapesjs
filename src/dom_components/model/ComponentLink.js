define(['./ComponentText'],
	function (Component) {

		return Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
					tagName: 'a',
					traits: ['title', 'href', 'target'],
			}),

		});
});
