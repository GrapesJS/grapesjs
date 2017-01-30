define(['./Component'],
	function (Component) {

		return Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
				droppable: false,
			}),

			toHTML: function() {
				return this.get('content');
			},

		}, {

			isComponent: function(el) {
				var result = '';
				if(el.nodeType === 3){
					result = {
						type: 'textnode',
						content: el.textContent
					};
				}
				return result;
			},

		});
});
