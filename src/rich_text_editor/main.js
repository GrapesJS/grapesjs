define(function(require) {

	return function(config) {
		var c = config || {},
			defaults = require('./config/config'),
			rte = require('./view/TextEditorView'),
			CommandButtons = require('./model/CommandButtons'),
			CommandButtonsView = require('./view/CommandButtonsView');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}

		var tlbPfx = c.stylePrefix;
		var toolbar = new CommandButtonsView({
			collection: new CommandButtons(c.commands),
			config: c,
		});

		return {

			/**
			 * Bind rich text editor to element
			 * @param {View} view
			 * */
			attach: function(view){
				view.$el.wysiwyg({hotKeys: {}}).focus();

				if(c.em){
					var u = 'px';
					var cvsView = c.em.get('Canvas').CanvasView;
					var dims = cvsView.getElementPos(view.el);
					var toolEl = toolbar.el;
					var toolS = toolbar.el.style;
					toolS.top = (dims.top - toolbar.$el.outerHeight()) + u;
					toolS.left = dims.left + u;
				}
				this.show();
				//Avoid closing edit mode clicking on toolbar
				toolbar.$el.on('mousedown', this.disableProp);
			},

			/**
			 * Unbind rich text editor from element
			 * @param		{Object}	view
			 *
			 * */
			detach: function(view){
				view.$el.wysiwyg('destroy');
				this.hide();
				toolbar.$el.off('mousedown', this.disableProp);
			},

			/**
			 * Show toolbar
			 *
			 * */
			show: function(){
				toolbar.el.style.display = 'block';
			},

			/**
			 * Hide toolbar
			 *
			 * */
			hide: function(){
				toolbar.el.style.display = 'none';
			},

			/**
			 * Isolate disable propagation method
			 *
			 * */
			disableProp: function(e){
				e.stopPropagation();
			},

			/**
			 * Return toolbar element
			 * @return {HTMLElement}
			 */
			getToolbarEl: function() {
				return toolbar.el;
			},

			/**
			 * Render toolbar
			 * @return {HTMLElement}
			 */
			render: function(){
				return toolbar.render().el;
			}

		};
	};

});