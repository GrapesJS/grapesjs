define(['./ComponentImage'],
	function (Component) {

		return Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
					mapUrl: 'https://maps.google.com/maps',
					tagName: 'iframe',
					mapType: 'q',
					address: '',
					zoom: '1',
					traits: [{
						label: 'Address',
						name: 'address',
						placeholder: 'eg. London, UK',
						changeProp: 1,
					},{
						type: 'select',
						label: 'Map type',
						name: 'mapType',
						changeProp: 1,
						options: [
							{value: 'q', name: 'Roadmap'},
							{value: 'w', name: 'Satellite'}
						]
					},{
						label: 'Zoom',
						name: 'zoom',
						type: 'range',
						min: '1',
						max: '20',
						changeProp: 1,
					}],
			}),

			initialize: function(o, opt) {
				if(this.get('src'))
					this.parseFromSrc();
				Component.prototype.initialize.apply(this, arguments);
			},

			/**
			 * Set attributes by src string
			 */
			parseFromSrc: function() {
				var uri = this.parseUri(this.get('src'));
				var qr = uri.query;
				if(qr.q)
					this.set('address', qr.q);
				if(qr.z)
					this.set('zoom', qr.z);
				if(qr.t)
					this.set('mapType', qr.t);
			},

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
				if(el.tagName == 'IFRAME' &&
					/maps\.google\.com/.test(el.src) ){
					result = {type: 'map', src: el.src};
				}
				return result;
			},

		});
});
