define(['backbone', './ComponentImageView'],
	function (Backbone, ComponentView) {

	return ComponentView.extend({

		tagName: 'div',

		events: {},

		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			this.listenTo(this.model, 'change:address change:zoom change:mapType', this.updateMap);
			this.classEmpty = this.ppfx + 'plh-map';
		},

		/**
		 * Update the map on the canvas
		 * @private
		 */
		updateMap: function(e, m) {
			this.getIframe().src = this.getMapUrl();
		},

		getMapUrl: function() {
			var md = this.model;
			var addr = md.get('address');
			var zoom = md.get('zoom');
			var type = md.get('mapType');
			var size = '';
			addr = addr ? '&q=' + addr : '';
			zoom = zoom ? '&z=' + zoom : '';
			type = type ? '&t=' + type : '';
			var result = md.get('mapUrl')+'?' + addr + zoom + type;
			result += '&output=embed';
			return result;
		},

		getIframe: function() {
			if(!this.iframe){
				var ifrm = document.createElement("iframe");
				ifrm.src = this.getMapUrl();
				ifrm.frameBorder = 0;
				ifrm.style.pointerEvents = 'none';
				ifrm.style.height = '100%';
				ifrm.style.width = '100%';
				this.iframe = ifrm;
			}
			return this.iframe;
		},

		render: function() {
			ComponentView.prototype.render.apply(this, arguments);
			this.updateClasses();
			this.el.appendChild(this.getIframe());
			return this;
		},

	});
});
