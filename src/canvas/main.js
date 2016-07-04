define(function(require) {
	/**
	 * @class 	Canvas
	 * @param 	{Object} Configurations
	 *
	 * @return	{Object}
 	 * */
	var Canvas	= function(config)
	{
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
			 * */
			getWrapper: function() {
				return this.canvas.get('wrapper').getComponent();
			},


			getFrameWrapperEl: function(){
				return this.CanvasView.frame.getWrapper();
			},

			/**
			 * Returns body element of the frame
			 * @return {[type]} [description]
			 */
			getBody: function(){
				return this.CanvasView.frame.el.contentDocument.body;
			},

			/**
			 * Render canvas
			 * */
			render: function() {
				return	this.CanvasView.render().el;
			},
	};

	return Canvas;
});