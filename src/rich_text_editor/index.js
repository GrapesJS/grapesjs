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
module.exports = () => {
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
    init(config) {
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
    add(command, opts) {
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
    get(command) {
      return commands.where({command})[0];
    },

    /**
     * Returns the collection of commands
     * @return {Collection}
     */
    getAll() {
      return commands;
    },

    /**
     * Triggered when the offset of the editor is changed
     * @private
     */
    udpatePosition() {
      var u = 'px';
      var canvas = c.em.get('Canvas');
      var pos = canvas.getTargetToElementDim(toolbar.el, this.lastEl, {
        event: 'rteToolbarPosUpdate',
      });

      if (c.adjustToolbar) {
        // Move the toolbar down when the top canvas edge is reached
        if (pos.top <= pos.canvasTop) {
          pos.top = pos.elementTop + pos.elementHeight;
        }
      }

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
    attach(view, rte) {
      // lastEl will be used to place the RTE toolbar
      this.lastEl = view.el;
      var el = view.getChildrenContainer();
      var customRte = this.customRte;

      // If a custom RTE is defined
      if (customRte) {
        rte = customRte.enable(el, rte);
      } else {
        $(el).wysiwyg({}).focus();
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
    detach(view, rte) {
      var customRte = this.customRte;
      var el = view.getChildrenContainer();
      if (customRte) {
        view.model.set('content', el.innerHTML);
        customRte.disable(el, rte);
      } else {
        $(el).wysiwyg('destroy');
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
    focus(view, rte) {
      var customRte = this.customRte;
      var el = view.getChildrenContainer();
      if (customRte) {
        if(customRte.focus)
          customRte.focus(el, rte);
      } else {
        this.attach(view);
      }
    },

    /**
     * Show the toolbar
     * @private
     * */
    show() {
      var toolbarStyle = toolbar.el.style;
      toolbarStyle.display = "block";
    },

    /**
     * Hide the toolbar
     * @private
     * */
    hide() {
      toolbar.el.style.display = "none";
    },

    /**
     * Isolate the disable propagation method
     * @private
     * */
    disableProp(e) {
      e.stopPropagation();
    },

    /**
     * Return toolbar element
     * @return {HTMLElement}
     * @private
     */
    getToolbarEl() {
      return toolbar.el;
    },

    /**
     * Render toolbar
     * @return {HTMLElement}
     * @private
     */
    render() {
      return toolbar.render().el;
    }

  };
};
