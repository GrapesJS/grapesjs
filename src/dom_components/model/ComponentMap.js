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

		});
});
