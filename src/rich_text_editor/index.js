/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [remove](#remove)
 * * [getToolbarEl](#gettoolbarel)
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
import RichTextEditor from './model/RichTextEditor';
import {on, off} from 'utils/mixins'

module.exports = () => {
  let config = {},
  defaults = require('./config/config'),
  rte = require('./view/TextEditorView'),
  CommandButtons = require('./model/CommandButtons'),
  CommandButtonsView = require('./view/CommandButtonsView');
  const $ = require('backbone').$;
  let toolbar, commands, lastEl;

  return {

    customRte: null,

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'RichTextEditor',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} opts Options
     * @private
     */
    init(opts) {
      config = opts || {};

      for (let name in defaults) {
        if (!(name in config)) {
          config[name] = defaults[name];
        }
      }

      const ppfx = config.pStylePrefix;

      if (ppfx) {
        config.stylePrefix = ppfx + config.stylePrefix;
      }

      toolbar = document.createElement('div');
      toolbar.className = `${ppfx}rte-toolbar`;

      //Avoid closing on toolbar clicking
      on(toolbar, 'mousedown', e => e.stopPropagation());

      /*
      commands = new CommandButtons(c.commands);
      toolbar = new CommandButtonsView({
        collection: commands,
        config: c,
      });
      */
      return this;
    },

    postRender(ev) {
      const canvas = ev.model.get('Canvas');
      toolbar.style.pointerEvents = 'all';
      canvas.getToolsEl().appendChild(toolbar);
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
      var canvas = config.em.get('Canvas');
      var pos = canvas.getTargetToElementDim(toolbar.el, lastEl, {
        event: 'rteToolbarPosUpdate',
      });

      if (config.adjustToolbar) {
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
     * Enable rich text editor on the element
     * @param {View} view Component view
     * @param {Object} rte The instance of already defined RTE
     * @private
     * */
    enable(view, rte) {
      lastEl = view.el;
      const em = config.em;
      const el = view.getChildrenContainer();
      const customRte = this.customRte;
      const actionbarContainer = toolbar;

      toolbar.style.display = '';
      rte = customRte ? customRte.enable(el, rte) :
        new RichTextEditor({el, actionbarContainer});

      if (em) {
        setTimeout(this.udpatePosition.bind(this), 0);
        const event = 'change:canvasOffset canvasScroll';
        em.off(event, this.udpatePosition, this);
        em.on(event, this.udpatePosition, this);
      }

      return rte;
    },

    /**
     * Unbind rich text editor from the element
     * @param {View} view
     * @param {Object} rte The instance of already defined RTE
     * @private
     * */
    disable(view, rte) {
      const customRte = this.customRte;
      var el = view.getChildrenContainer();

      if (customRte) {
        customRte.disable(el, rte);
      } else {
        rte.disable();
      }

      toolbar.style.display = 'none';
    },

    /**
     * Return the toolbar element
     * @return {HTMLElement}
     * @private
     */
    getToolbarEl() {
      return toolbar;
    },
  };
};
