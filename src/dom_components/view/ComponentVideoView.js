define(['backbone', './ComponentImageView'],
	function (Backbone, ComponentView) {

	return ComponentView.extend({

		tagName: 'div',

		events: {},

		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			this.listenTo(this.model, 'change:loop change:autoplay change:controls', this.updateVideo);
		},

		/**
		 * Update the source of the video
		 * @private
		 */
		updateSrc: function() {
			this.videoEl.src = this.model.get('src');
			console.log('update source');
		},

		/**
		 * Update video parameters
		 * @private
		 */
		updateVideo: function() {
			var videoEl = this.videoEl;
			var md = this.model;
			videoEl.loop = md.get('loop');
			videoEl.autoplay = md.get('autoplay');
			videoEl.controls = md.get('controls');
		},

		renderByProvider: function(prov) {
			var videoEl;
			switch (prov) {
				case 'yt':

					break;
				default:
					videoEl = this.renderSource();
			}
			this.videoEl = videoEl;
			return videoEl;
		},

		renderSource: function() {
			var el = document.createElement('video');
			el.src = this.model.get('src');
			el.style.pointerEvents = 'none';
			el.style.height = '100%';
			el.style.width = '100%';
			return el;
		},

		render: function() {
			ComponentView.prototype.render.apply(this, arguments);
			this.updateClasses();
			var prov = this.model.get('provider');
			this.el.appendChild(this.renderByProvider(prov));
			return this;
		},

	});
});
