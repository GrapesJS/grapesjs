define(function(require) {
	/**
	 * @class 	Canvas}
 	 * */
	return function() {
		var c = {},
		defaults = require('./config/config'),
		Canvas = require('./model/Canvas'),
		CanvasView = require('./view/CanvasView');
		var canvas;

		return {

      /**
       * Used inside RTE
       * @private
       */
      getCanvasView: function() {
        return CanvasView;
      },

			/**
       * Name of the module
       * @type {String}
       * @private
       */
      name: 'Canvas',

      /**
       * Initialize module. Automatically called with a new instance of the editor
       * @param {Object} config Configurations
       */
      init: function(config) {
        c = config || {};
        for (var name in defaults) {
					if (!(name in c))
						c[name] = defaults[name];
				}

				var ppfx = c.pStylePrefix;
				if(ppfx)
					c.stylePrefix = ppfx + c.stylePrefix;

				canvas = new Canvas(config);
				CanvasView	= new CanvasView({
					model: canvas,
				  config: c,
				});

				var cm = c.em.get('DomComponents');
				if(cm)
					this.setWrapper(cm);

        return this;
      },

			/**
			 * Add wrapper
			 * @param	{Object}	wrp Wrapper
			 *
			 * */
			setWrapper: function(wrp) {
				canvas.set('wrapper', wrp);
			},

			/**
			 * Returns canvas element
			 * @return {HTMLElement}
			 */
			getElement: function(){
				return CanvasView.el;
			},

			/**
			 * Returns frame element of the canvas
			 * @return {HTMLElement}
			 */
			getFrameEl: function(){
				return CanvasView.frame.el;
			},

			/**
			 * Returns body element of the frame
			 * @return {HTMLElement}
			 */
			getBody: function(){
				return CanvasView.frame.el.contentDocument.body;
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
				return CanvasView.toolsEl;
			},

			/**
			 * Returns highlighter element
			 * @return {HTMLElement}
			 */
			getHighlighter: function(){
				return CanvasView.hlEl;
			},

			/**
			 * Returns badge element
			 * @return {HTMLElement}
			 */
			getBadgeEl: function(){
				return CanvasView.badgeEl;
			},

			/**
			 * Returns placer element
			 * @return {HTMLElement}
			 */
			getPlacerEl: function(){
				return CanvasView.placerEl;
			},

			/**
			 * Returns ghost element
			 * @return {HTMLElement}
			 * @private
			 */
			getGhostEl: function(){
				return CanvasView.ghostEl;
			},

			/**
			 * Returns toolbar element
			 * @return {HTMLElement}
			 */
			getToolbarEl: function(){
				return CanvasView.toolbarEl;
			},

			/**
			 * Render canvas
			 * */
			render: function() {
				return CanvasView.render().el;
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
				return CanvasView.frame.getWrapper();
			},
		};
	};

});
