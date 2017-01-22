define(['backbone','./FrameView'],
function(Backbone, FrameView) {
	/**
	 * @class CanvasView
	 * */
	return Backbone.View.extend({

		initialize: function(o) {
      _.bindAll(this, 'renderBody', 'onFrameScroll', 'clearOff');
			this.config = o.config || {};
      this.em = this.config.em || {};
			this.ppfx	= this.config.pStylePrefix || '';
			this.className	= this.config.stylePrefix + 'canvas';
			this.listenTo(this.em, 'change:canvasOffset', this.clearOff);
			this.frame = new FrameView({
        model: this.model.get('frame'),
        config: this.config
      });
		},

    /**
     * Update tools position
     * @private
     */
    onFrameScroll: function(){
      var u = 'px';
      var body = this.frame.el.contentDocument.body;
      this.toolsEl.style.top = '-' + body.scrollTop + u;
      this.toolsEl.style.left = '-' + body.scrollLeft + u;
    },

		/**
		 * Render inside frame's body
		 * @private
		 */
		renderBody: function(){
			var wrap = this.model.get('frame').get('wrapper');
      if(wrap){
				var ppfx = this.ppfx;
        var body = this.frame.$el.contents().find('body');
        var cssc = this.config.em.get('CssComposer');
        var conf = this.config.em.get('Config');
        body.append(wrap.render()).append(cssc.render());
        var protCss = conf.protectedCss;
        var frameCss = '.' + ppfx + 'dashed *{outline: 1px dashed rgba(170,170,170,0.7); outline-offset: -2px}' +
        							 '.' + ppfx + 'comp-selected{outline: 3px solid #3b97e3 !important}' +
                       '.' + ppfx + 'no-select{user-select: none; -webkit-user-select:none; -moz-user-select: none}'+
                       '.' + ppfx + 'freezed{opacity: 0.5; pointer-events: none}' +
											 '.' + ppfx + 'no-pointer{pointer-events: none}' +
                       '.' + ppfx + 'plh-image{background:#f5f5f5; border:none; height:50px; width:50px; display:block; outline:3px solid #ffca6f; cursor:pointer}';
        if(protCss)
        	body.append('<style>' + frameCss + protCss + '</style>');
        this.config.em.trigger('loaded');
        this.frame.el.contentWindow.onscroll = this.onFrameScroll;
        this.frame.udpateOffset();

        // When the iframe is focused the event dispatcher is not the same so
        // I need to delegate all events to the parent document
        var doc = document;
        var fdoc = this.frame.el.contentDocument;
        fdoc.addEventListener('keydown', function(e){
          doc.dispatchEvent(new KeyboardEvent(e.type, e));
        });
        fdoc.addEventListener('keyup', function(e){
          doc.dispatchEvent(new KeyboardEvent(e.type, e));
        });
      }
		},

    /**
     * Get the offset of the element
     * @param  {HTMLElement} el
     * @return {Object}
     */
    offset: function(el){
      var rect = el.getBoundingClientRect();
      var docBody = el.ownerDocument.body;
      return {
        top: rect.top + docBody.scrollTop,
        left: rect.left + docBody.scrollLeft
      };
    },

		/**
		 * Cleare cached offsets
		 * @private
		 */
		clearOff: function(){
			this.frmOff = null;
			this.cvsOff = null;
		},

    /**
     * Returns element's data info
     * @param {HTMLElement} el
     * @return {Object}
     * @private
     */
    getElementPos: function(el){
      if(!this.frmOff)
        this.frmOff = this.offset(this.frame.el);
      if(!this.cvsOff)
        this.cvsOff = this.offset(this.el);
      var eo = this.offset(el);
      var top = eo.top + this.frmOff.top - this.cvsOff.top;
      var left = eo.left + this.frmOff.left - this.cvsOff.left;
      return {
        top: top,
        left: left,
        height: el.offsetHeight,
        width: el.offsetWidth
      };
    },

		/**
		 * Returns position data of the canvas element
		 * @return {Object} obj Position object
		 */
		getPosition: function() {
			var bEl = this.frame.el.contentDocument.body;
			var fo = this.frmOff;
			var co = this.cvsOff;
			return {
				top: fo.top + bEl.scrollTop - co.top,
				left: fo.left + bEl.scrollLeft - co.left
			};
		},


		render: function() {
			this.wrapper	= this.model.get('wrapper');

			if(this.wrapper && typeof this.wrapper.render == 'function'){
				this.model.get('frame').set('wrapper', this.wrapper);
				this.$el.append(this.frame.render().el);
				var frame = this.frame;
				frame.el.onload = this.renderBody;
			}
			var ppfx = this.ppfx;
			this.toolsEl = $('<div>', { id: ppfx + 'tools' }).get(0);
			this.hlEl = $('<div>', { class: ppfx + 'highlighter' }).get(0);
			this.badgeEl = $('<div>', {class: ppfx + 'badge'}).get(0);
			this.placerEl = $('<div>', {class: ppfx + 'placeholder'}).get(0);
			this.placerIntEl = $('<div>', {class: ppfx + 'placeholder-int'}).get(0);
			this.ghostEl = $('<div>', {class: ppfx + 'ghost'}).get(0);
			this.toolbarEl = $('<div>', {class: ppfx + 'toolbar'}).get(0);
			this.placerEl.appendChild(this.placerIntEl);
			this.toolsEl.appendChild(this.hlEl);
			this.toolsEl.appendChild(this.badgeEl);
			this.toolsEl.appendChild(this.placerEl);
			this.toolsEl.appendChild(this.ghostEl);
			this.toolsEl.appendChild(this.toolbarEl);
			this.$el.append(this.toolsEl);
      var rte = this.em.get('rte');

      if(rte)
        this.toolsEl.appendChild(rte.render());

			this.$el.attr({class: this.className});
			return this;
		},

	});
});
