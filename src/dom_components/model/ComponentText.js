define(['./Component'],
	function (Component) {

		return Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
				type: 'text',
				droppable: false,
				editable: true,
			}),

		});
});
