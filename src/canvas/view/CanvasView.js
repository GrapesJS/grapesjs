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
			this.badgeEl = $('<div>', {class: this.ppfx + 'badge'}).get(0);
			this.placerEl = $('<div>', {class: this.ppfx + 'placeholder'}).get(0);
			this.placerIntEl = $('<div>', {class: this.ppfx + 'placeholder-int'}).get(0);
      this.ghostEl = $('<div>', {class: this.ppfx + 'ghost'}).get(0);
			this.placerEl.appendChild(this.placerIntEl);
			this.toolsEl.appendChild(this.hlEl);
			this.toolsEl.appendChild(this.badgeEl);
			this.toolsEl.appendChild(this.placerEl);
      this.toolsEl.appendChild(this.ghostEl);
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
        var frameCss = '.' + this.ppfx	+ 'dashed *{outline: 1px dashed rgba(170,170,170,0.7); outline-offset: -2px}' +
        							 '.' + this.ppfx	+ 'comp-selected{outline: 3px solid #3b97e3 !important}' +
                       '.' + this.ppfx  + 'no-select{user-select: none; -webkit-user-select:none; -moz-user-select: none}'+
                       '.' + this.ppfx  + 'freezed{opacity: 0.5; pointer-events: none}' +
                       '.' + this.ppfx  + 'plh-image{background:#f5f5f5; border:none; height:50px; width:50px; display:block; outline:3px solid #ffca6f; cursor:pointer}';
        if(protCss)
        	body.append('<style>' + frameCss + protCss + '</style>');
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