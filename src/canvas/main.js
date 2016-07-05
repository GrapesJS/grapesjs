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
			 * Get wrapper
			 *
			 * @return	{Object}
			 * *
			getWrapper: function() {
				return this.canvas.get('wrapper').getComponent();
			},
			*/

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
			 * Returns selector highlighter element
			 * @return {HTMLElement}
			 */
			getHighlighterSel: function(){
				return this.CanvasView.hlSelEl;
			},

			/**
			 * Returns badge element
			 * @return {HTMLElement}
			 */
			getBadgeEl: function(){
				return this.CanvasView.badgeEl;
			},

			/**
			 * Render canvas
			 * */
			render: function() {
				return	this.CanvasView.render().el;
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