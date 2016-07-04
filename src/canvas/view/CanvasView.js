define(['backbone','./FrameView'],
function(Backbone, FrameView) {
	/**
	 * @class CanvasView
	 * */
	return Backbone.View.extend({

		initialize: function(o) {
			this.config		= o.config;
			this.className	= this.config.stylePrefix + 'canvas';
			this.frame = new FrameView({
				model: this.model.get('frame')
			});
		},

		render: function() {
			this.wrapper	= this.model.get('wrapper');

			if(this.wrapper && typeof this.wrapper.render == 'function'){
				this.model.get('frame').set('wrapper', this.wrapper);
				var wrap = this.wrapper.render();
				this.$el.append(this.frame.render().el);
				var frame = this.frame;
				frame.el.onload = function(){ frame.renderWrapper(); };
			}

			this.$el.attr({class: this.className, id: this.config.canvasId});
			return this;
		},

	});
});