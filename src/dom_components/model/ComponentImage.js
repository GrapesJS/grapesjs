define(['./Component'],
	function (Component) {

		return Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
				type: 'image',
				tagName: 'img',
				src: '',
				void: 1,
				droppable: false,
				traits: ['alt'],
			}),

			/**
			 * Returns attributes string in HTML
			 * @return {string}
			 * @private
			 */
			toAttrHTML: function() {
				var attr = '';
				_.each(this.get('attributes'), function(value, prop){
					if(prop == 'onmousedown')
						return;
					attr += value && prop!='style' ? ' ' + prop + '="' + value + '"' : '';
				});

				var src = this.get('src');
				if(src)
					attr += ' src="' + src + '"';

				return attr;
			}

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
				if(el.tagName == 'IMG'){
					result = {type: 'image', tagName: 'img'};
					result.src = el.src;
				}
				return result;
			},

		});
});
