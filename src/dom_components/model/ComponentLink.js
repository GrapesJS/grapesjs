define(['./ComponentText'],
	function (Component) {

		return Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
					tagName: 'a',
					traits: ['title', 'href', 'target'],
			}),

		},{

			/**
			 * Detect if the passed element is a valid component.
			 * In case the element is valid an object abstracted
			 * from the element will be returned
			 * @param {HTMLElement}
			 * @return {Object}
			 * @private
			 */
			isComponent: function(el) {
				var result = '';
				if(el.tagName == 'A'){
					result = {type: 'link', tagName: 'a'};
				}
				return result;
			},

		});
});
