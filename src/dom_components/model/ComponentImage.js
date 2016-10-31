define(['./Component'],
	function (Component) {

		return Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
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

		});
});
