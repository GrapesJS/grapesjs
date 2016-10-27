define(['./Component'],
	function (Component) {

		return Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
					tagName: 'iframe',
          staticUrl: 'http://maps.googleapis.com/maps/api/staticmap',
          mapUrl: 'https://maps.google.com/maps',
          zoom: '1',
          mapType: '',
          staticHeight: '',
          staticWidth: '',
          src: 'http://maps.googleapis.com/maps/api/staticmap?zoom=1&format=jpg&size=500x300',//'https://maps.google.com/maps?output=embed',
					traits: ['mapTraits'],
			}),

		});
});
