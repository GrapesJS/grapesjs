/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [remove](#remove)
 *
 * This module allows to customize the toolbar of the Rich Text Editor and use commands from the HTML Editing APIs.
 * For more info about HTML Editing APIs check here:
 * https://developer.mozilla.org/it/docs/Web/API/Document/execCommand
 *
 * It's highly recommended to keep this toolbar as small as possible, especially from styling commands (eg. 'fontSize')
 * and leave this task to the Style Manager.
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var rte = editor.RichTextEditor;
 * ```
 * Complete list of commands
 * https://developer.mozilla.org/it/docs/Web/API/Document/execCommand
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
		var mainSelf;

		return {

			customRte: null,

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
				mainSelf = this;
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
       * Add a new command to the toolbar
       * @param {string} command Command name
       * @param {Object} opts Command options
       * @return {Model} Added command
       * @example
       * var cm = rte.add('bold', {
       *   title: 'Make bold',
       *   class: 'fa fa-bold',
       * });
       * // With arguments
       * var cm = rte.add('fontSize', {
       *   title: 'Font size',
       *   options: [
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
       * Get the command by its name
       * @param {string} command Command name
       * @return {Model}
       * @example
       * var cm = rte.get('fontSize');
       */
      get: function(command) {
        return commands.where({command: command})[0];
      },

      /**
       * Returns the collection of commands
       * @return {Collection}
       */
      getAll: function(){
        return commands;
      },

			/**
       * Triggered when the offset of the editro is changed
       * @private
       */
      udpatePosition: function() {
				var u = 'px';
				var canvas = c.em.get('Canvas');
				var pos = canvas.getTargetToElementDim(toolbar.el, this.lastEl, {
					event: 'rteToolbarPosUpdate',
				});
				var toolbarStyle = toolbar.el.style;
				toolbarStyle.top = pos.top + u;
				toolbarStyle.left = pos.left + u;
      },

			/**
			 * Bind rich text editor to the element
			 * @param {View} view
			 * @param {Object} rte The instance of already defined RTE
       * @private
			 * */
			attach: function(view, rte) {
				this.lastEl = view.el;
				var customRte = this.customRte;

				// If a custom RTE is defined
				if (customRte) {
					rte = customRte.enable(view.el, rte);
				} else {
					view.$el.wysiwyg({}).focus();
				}

				this.show();

				if(c.em) {
					setTimeout(this.udpatePosition.bind(this), 0);
					c.em.off('change:canvasOffset', this.udpatePosition, this);
					c.em.on('change:canvasOffset', this.udpatePosition, this);
					// Update position on scrolling
					c.em.off('canvasScroll', this.udpatePosition, this);
					c.em.on('canvasScroll', this.udpatePosition, this);
				}

				//Avoid closing edit mode clicking on toolbar
				toolbar.$el.on('mousedown', this.disableProp);
				return rte;
			},

			/**
			 * Unbind rich text editor from the element
			 * @param {View} view
			 * @param {Object} rte The instance of already defined RTE
			 * @private
			 * */
			detach: function(view, rte) {
				var customRte = this.customRte;
				if (customRte) {
					view.model.set('content', view.el.innerHTML);
					customRte.disable(view.el, rte);
				} else {
					view.$el.wysiwyg('destroy');
				}
				this.hide();
				toolbar.$el.off('mousedown', this.disableProp);
			},

			/**
			 * Unbind rich text editor from the element
			 * @param {View} view
			 * @param {Object} rte The instance of already defined RTE
			 * @private
			 * */
			focus: function(view, rte) {
				var customRte = this.customRte;
				if (customRte) {
					if(customRte.focus)
            customRte.focus(view.el, rte);
				} else {
					this.attach(view);
				}
			},

			/**
			 * Show the toolbar
			 * @private
			 * */
			show: function() {
				var toolbarStyle = toolbar.el.style;
        toolbarStyle.display = "block";
			},

			/**
			 * Hide the toolbar
			 * @private
			 * */
			hide: function() {
        toolbar.el.style.display = "none";
			},

			/**
			 * Isolate the disable propagation method
			 * @private
			 * */
			disableProp: function(e) {
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
