define(['backbone','./FrameView'],
function(Backbone, FrameView) {
	/**
	 * @class CanvasView
	 * */
	return Backbone.View.extend({

		initialize: function(o) {
			this.config = o.config || {};
			this.ppfx	= this.config.pStylePrefix || '';
			this.className	= this.config.stylePrefix + 'canvas';
			this.frame = new FrameView({ model: this.model.get('frame')});
			this.toolsEl = $('<div>', { id: this.ppfx + 'tools' }).get(0);
			this.hlEl = $('<div>', { class: this.ppfx + 'highlighter' }).get(0);
			this.hlSelEl = $('<div>', { class: this.ppfx + 'highlighter-sel' }).get(0);
			this.badgeEl = $('<div>', {class: this.ppfx + 'badge'}).get(0);
			this.toolsEl.appendChild(this.hlEl);
			this.toolsEl.appendChild(this.hlSelEl);
			this.toolsEl.appendChild(this.badgeEl);
		},

		/**
		 * Render inside frame's body
		 * @private
		 */
		renderBody: function(){
			var wrap = this.model.get('frame').get('wrapper');
      if(wrap){
        var body = this.frame.$el.contents().find('body');
        var cssc = this.config.em.get('CssComposer');
        var conf = this.config.em.get('Config');
        body.append(wrap.render()).append(cssc.render());
        var protCss = conf.protectedCss;
        if(protCss)
        	body.append('<style>' + protCss + '</style>');
      }
		},

		render: function() {
			this.wrapper	= this.model.get('wrapper');

			if(this.wrapper && typeof this.wrapper.render == 'function'){
				this.model.get('frame').set('wrapper', this.wrapper);
				var wrap = this.wrapper.render();
				this.$el.append(this.frame.render().el);
				var frame = this.frame;
				frame.el.onload = this.renderBody.bind(this);
			}

			this.$el.append(this.toolsEl);
			this.$el.attr({class: this.className, id: this.config.canvasId});
			return this;
		},

	});
});