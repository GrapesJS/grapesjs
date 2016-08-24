/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [remove](#remove)
 *
 * This module allows to customize the toolbar of the Rich Text Editor
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var rte = editor.RichTextEditor;
 * ```
 * Complete list of commands
 * http://www.quirksmode.org/dom/execCommand.html
 * @module RichTextEditor
 */
define(function(require) {

	return function() {
		var c = {},
		defaults = require('./config/config'),
		rte = require('./view/TextEditorView'),
		CommandButtons = require('./model/CommandButtons'),
		CommandButtonsView = require('./view/CommandButtonsView');
		var tlbPfx, toolbar, commands;

		return {

			/**
       * Name of the module
       * @type {String}
       * @private
       */
      name: 'rte',

      /**
       * Initialize module. Automatically called with a new instance of the editor
       * @param {Object} config Configurations
       * @private
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

				tlbPfx = c.stylePrefix;
        commands = new CommandButtons(c.commands);
				toolbar = new CommandButtonsView({
					collection: commands,
					config: c,
				});
        return this;
      },

      /**
       * Add new command to the toolbar
       * @param {string} command Command name
       * @param {string} command Command name
       * @example
       * var cm = rte.add('bold', {
       *   title: 'Make bold',
       *   class: 'fa fa-bold',
       * });
       * // With arguments
       * var cm = rte.add('fontSize', {
       *   title: 'Font size',
       *   arguments: [
       *     {name: 'Big', value: 5},
       *     {name: 'Normal', value: 3},
       *     {name: 'Small', value: 1}
       *   ]
       * });
       */
      add: function(command, opts) {
        var obj = opts || {};
        obj.command = command;
        return commands.add(obj);
      },

			/**
       * Triggered when the offset of the editro is changed
       * @private
       */
      udpatePosition: function(){
      	if(!this.lastEl || !c.em)
      		return;
      	var u = 'px';
        var eOffset = c.em.get('canvasOffset');
        var cvsView = c.em.get('Canvas').getCanvasView();
        var dims = cvsView.getElementPos(this.lastEl);
        var toolS = toolbar.el.style;
        var toolH = toolbar.$el.outerHeight();
        toolS.top = (dims.top - toolH) + u;
				toolS.left = (dims.left + eOffset.left) + u;
      },

			/**
			 * Bind rich text editor to the element
			 * @param {View} view
       * @private
			 * */
			attach: function(view){
				view.$el.wysiwyg({}).focus();
				this.lastEl = view.el;

				if(c.em){
					this.udpatePosition();
					c.em.off('change:canvasOffset', this.udpatePosition, this);
					c.em.on('change:canvasOffset', this.udpatePosition, this);
				}
				this.show();
				//Avoid closing edit mode clicking on toolbar
				toolbar.$el.on('mousedown', this.disableProp);
			},

			/**
			 * Unbind rich text editor from the element
			 * @param {View} view
			 * @private
			 * */
			detach: function(view){
				view.$el.wysiwyg('destroy');
				this.hide();
				toolbar.$el.off('mousedown', this.disableProp);
			},

			/**
			 * Show the toolbar
			 * @private
			 * */
			show: function(){
				toolbar.el.style.display = 'block';
			},

			/**
			 * Hide the toolbar
			 * @private
			 * */
			hide: function(){
				toolbar.el.style.display = 'none';
			},

			/**
			 * Isolate the disable propagation method
			 * @private
			 * */
			disableProp: function(e){
				e.stopPropagation();
			},

			/**
			 * Return toolbar element
			 * @return {HTMLElement}
       * @private
			 */
			getToolbarEl: function() {
				return toolbar.el;
			},

			/**
			 * Render toolbar
			 * @return {HTMLElement}
       * @private
			 */
			render: function(){
				return toolbar.render().el;
			}

		};
	};

});