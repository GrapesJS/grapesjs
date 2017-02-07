define(['backbone', './ComponentImageView'],
	function (Backbone, ComponentView) {

	return ComponentView.extend({

		tagName: 'div',

		events: {},

		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			this.classEmpty = this.ppfx + 'plh-map';
		},

		/**
		 * Update the map on the canvas
		 * @private
		 */
		updateSrc: function() {
			this.getIframe().src = this.model.get('src');
		},

		getIframe: function() {
			if(!this.iframe){
				var ifrm = document.createElement("iframe");
				ifrm.src = this.model.get('src');
				ifrm.frameBorder = 0;
				ifrm.style.height = '100%';
				ifrm.style.width = '100%';
				ifrm.className = this.ppfx + 'no-pointer';
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
