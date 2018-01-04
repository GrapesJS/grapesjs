/**
 * This module allows to customize the toolbar of the Rich Text Editor and use commands from the HTML Editing APIs.
 * For more info about HTML Editing APIs check here:
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
 *
 * It's highly recommended to keep this toolbar as small as possible, especially from styling commands (eg. 'fontSize')
 * and leave this task to the Style Manager.
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var rte = editor.RichTextEditor;
 * ```
 * @module RichTextEditor
 */
import RichTextEditor from './model/RichTextEditor';
import {on, off} from 'utils/mixins'

module.exports = () => {
  let config = {};
  const defaults = require('./config/config');
  let toolbar, actions, lastEl, globalRte;

  const hideToolbar = () => {
    const style = toolbar.style;
    const size = '-100px';
    style.top = size;
    style.left = size;
    style.display = 'none';
  };

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
    init(opts = {}) {
      config = opts;

      for (let name in defaults) {
        if (!(name in config)) {
          config[name] = defaults[name];
        }
      }

      const ppfx = config.pStylePrefix;

      if (ppfx) {
        config.stylePrefix = ppfx + config.stylePrefix;
      }

      this.pfx = config.stylePrefix;
      actions = config.actions || [];
      toolbar = document.createElement('div');
      toolbar.className = `${ppfx}rte-toolbar ${ppfx}one-bg`;
      globalRte = this.initRte(document.createElement('div'));

      //Avoid closing on toolbar clicking
      on(toolbar, 'mousedown', e => e.stopPropagation());
      return this;
    },


    /**
     * Post render callback
     * @param  {View} ev
     * @private
     */
    postRender(ev) {
      const canvas = ev.model.get('Canvas');
      toolbar.style.pointerEvents = 'all';
      hideToolbar();
      canvas.getToolsEl().appendChild(toolbar);
    },


    /**
     * Init the built-in RTE
     * @param  {HTMLElement} el
     * @return {RichTextEditor}
     * @private
     */
    initRte(el) {
      const pfx = this.pfx;
      const actionbarContainer = toolbar;
      const actionbar = this.actionbar;
      const actions = this.actions || config.actions;
      const classes = {
        actionbar: `${pfx}actionbar`,
        button: `${pfx}action`,
        active: `${pfx}active`,
      };
      const rte = new RichTextEditor({
        el,
        classes,
        actions,
        actionbar,
        actionbarContainer,
      });
      globalRte && globalRte.setEl(el);

      if (rte.actionbar) {
        this.actionbar = rte.actionbar;
      }

      if (rte.actions) {
        this.actions = rte.actions;
      }

      return rte;
    },

    /**
     * Add a new action to the built-in RTE toolbar
     * @param {string} name Action name
     * @param {Object} action Action options
     * @example
     * rte.add('bold', {
     *   icon: '<b>B</b>',
     *   attributes: {title: 'Bold',}
     *   result: rte => rte.exec('bold')
     * });
     * rte.add('link', {
     *   icon: document.getElementById('t'),
     *   attributes: {title: 'Link',}
     *   // Example on it's easy to wrap a selected content
     *   result: rte => rte.insertHTML(`<a href="#">${rte.selection()}</a>`)
     * });
     * // An example with fontSize
     * rte.add('fontSize', {
     *   icon: `<select class="gjs-field">
     *         <option>1</option>
     *         <option>4</option>
     *         <option>7</option>
     *       </select>`,
     *     // Bind the 'result' on 'change' listener
     *   event: 'change',
     *   result: (rte, action) => rte.exec('fontSize', action.btn.firstChild.value),
     *   // Callback on any input change (mousedown, keydown, etc..)
     *   update: (rte, action) => {
     *     const value = rte.doc.queryCommandValue(action.name);
     *     if (value != 'false') { // value is a string
     *       action.btn.firstChild.value = value;
     *     }
     *    }
     *   })
     */
    add(name, action = {}) {
      action.name = name;
      globalRte.addAction(action, {sync: 1});
    },

    /**
     * Get the action by its name
     * @param {string} name Action name
     * @return {Object}
     * @example
     * const action = rte.get('bold');
     * // {name: 'bold', ...}
     */
    get(name) {
      let result;
      globalRte.getActions().forEach(action => {
        if (action.name == name) {
          result = action;
        }
      });
      return result;
    },

    /**
     * Get all actions
     * @return {Array}
     */
    getAll() {
      return globalRte.getActions();
    },

    /**
     * Remove the action from the toolbar
     * @param  {string} name
     * @return {Object} Removed action
     * @example
     * const action = rte.remove('bold');
     * // {name: 'bold', ...}
     */
    remove(name) {
      const actions = this.getAll();
      const action = this.get(name);

      if (action) {
        const btn = action.btn;
        const index = actions.indexOf(action);
        btn.parentNode.removeChild(btn);
        actions.splice(index, 1);
      }

      return action;
    },

    /**
     * Get the toolbar element
     * @return {HTMLElement}
     */
    getToolbarEl() {
      return toolbar;
    },

    /**
     * Triggered when the offset of the editor is changed
     * @private
     */
    udpatePosition() {
      const un = 'px';
      const canvas = config.em.get('Canvas');
      const pos = canvas.getTargetToElementDim(toolbar, lastEl, {
        event: 'rteToolbarPosUpdate',
      });

      if (config.adjustToolbar) {
        // Move the toolbar down when the top canvas edge is reached
        if (pos.top <= pos.canvasTop) {
          pos.top = pos.elementTop + pos.elementHeight;
        }
      }

      const toolbarStyle = toolbar.style;
      toolbarStyle.top = pos.top + un;
      toolbarStyle.left = pos.left + un;
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

      toolbar.style.display = '';
      rte = customRte ? customRte.enable(el, rte) : this.initRte(el).enable();

      if (em) {
        setTimeout(this.udpatePosition.bind(this), 0);
        const event = 'change:canvasOffset canvasScroll';
        em.off(event, this.udpatePosition, this);
        em.on(event, this.udpatePosition, this);
        em.trigger('rte:enable', view, rte);
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
      const em = config.em;
      const customRte = this.customRte;
      var el = view.getChildrenContainer();

      if (customRte) {
        customRte.disable(el, rte);
      } else {
        rte && rte.disable();
      }

      hideToolbar();
      em && em.trigger('rte:disable', view, rte);
    },
  };
};
