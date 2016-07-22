define(function(require) {
	/**
	 * @class 	Canvas
	 * @param 	{Object} Configurations
	 *
	 * @return	{Object}
 	 * */
	var Canvas	= function(config) {
		var c			= config || {},
			defaults	= require('./config/config'),
			Canvas		= require('./model/Canvas'),
			CanvasView	= require('./view/CanvasView');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}

		this.canvas		= new Canvas(config);
		var obj			= {
				model	: this.canvas,
		    config	: c,
		};

		this.CanvasView	= new CanvasView(obj);
	};

	Canvas.prototype	= {

			/**
			 * Add wrapper
			 * @param	{Object}	wrp Wrapper
			 *
			 * */
			setWrapper: function(wrp) {
				this.canvas.set('wrapper', wrp);
			},

			/**
			 * Returns canvas element
			 * @return {HTMLElement}
			 */
			getElement: function(){
				return this.CanvasView.el;
			},

			/**
			 * Returns frame element of the canvas
			 * @return {HTMLElement}
			 */
			getFrameEl: function(){
				return this.CanvasView.frame.el;
			},

			/**
			 * Returns body element of the frame
			 * @return {HTMLElement}
			 */
			getBody: function(){
				return this.CanvasView.frame.el.contentDocument.body;
			},

			/**
			 * Returns body wrapper element of the frame
			 * @return {HTMLElement}
			 */
			getWrapperEl: function(){
				return this.getBody().querySelector('#wrapper');
			},

			/**
			 * Returns element containing canvas tools
			 * @return {HTMLElement}
			 */
			getToolsEl: function(){
				return this.CanvasView.toolsEl;
			},

			/**
			 * Returns highlighter element
			 * @return {HTMLElement}
			 */
			getHighlighter: function(){
				return this.CanvasView.hlEl;
			},

			/**
			 * Returns badge element
			 * @return {HTMLElement}
			 */
			getBadgeEl: function(){
				return this.CanvasView.badgeEl;
			},

			/**
			 * Returns placer element
			 * @return {HTMLElement}
			 */
			getPlacerEl: function(){
				return this.CanvasView.placerEl;
			},

			/**
			 * Returns ghost element
			 * @return {HTMLElement}
			 * @private
			 */
			getGhostEl: function(){
				return this.CanvasView.ghostEl;
			},

			/**
			 * Render canvas
			 * */
			render: function() {
				return	this.CanvasView.render().el;
			},

			/**
			 * Get frame position
			 * @return {Object}
			 * @private
			 */
			getOffset: function() {
				var frameOff = this.offset(this.getFrameEl());
				var canvasOff = this.offset(this.getElement());
				return {
					top: frameOff.top - canvasOff.top,
					left: frameOff.left - canvasOff.left
				};
			},

			/**
       * Get the offset of the element
       * @param  {HTMLElement} el
       * @return {Object}
       * @private
       */
      offset: function(el){
        var rect = el.getBoundingClientRect();
        return {
          top: rect.top + document.body.scrollTop,
          left: rect.left + document.body.scrollLeft
        };
      },

			/**
			 * Returns wrapper element
			 * @return {HTMLElement}
			 * ????
			 */
			getFrameWrapperEl: function(){
				return this.CanvasView.frame.getWrapper();
			},
	};

	return Canvas;
});