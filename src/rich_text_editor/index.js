/**
 * This module allows to customize the built-in toolbar of the Rich Text Editor and use commands from the [HTML Editing APIs](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand).
 * It's highly recommended to keep this toolbar as small as possible, especially from styling commands (eg. 'fontSize') and leave this task to the Style Manager
 *
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/rich_text_editor/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  richTextEditor: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
 *
 * ```js
 * // Listen to events
 * editor.on('rte:enable', () => { ... });
 *
 * // Use the API
 * const rte = editor.RichTextEditor;
 * rte.add(...);
 * ```
 *
 * ## Available Events
 * * `rte:enable` - RTE enabled. The view, on which RTE is enabled, is passed as an argument
 * * `rte:disable` - RTE disabled. The view, on which RTE is disabled, is passed as an argument
 *
 * ## Methods
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [remove](#remove)
 * * [getToolbarEl](#gettoolbarel)
 *
 * @module RichTextEditor
 */

import { on, hasWin } from '../utils/mixins';
import RichTextEditor from './model/RichTextEditor';
import defaults from './config/config';

const eventsUp = 'change:canvasOffset frame:scroll component:update';

export default () => {
  let toolbar;

  const hideToolbar = () => {
    const style = toolbar.style;
    const size = '-1000px';
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

    getConfig() {
      return this.config;
    },

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} opts Options
     * @private
     */
    init(opts = {}) {
      const config = { ...defaults, ...opts };
      const ppfx = config.pStylePrefix;

      if (ppfx) {
        config.stylePrefix = ppfx + config.stylePrefix;
      }

      this.config = config;
      this.pfx = config.stylePrefix;
      this.em = config.em;
      this.actions = config.actions || [];
      if (!hasWin()) return this;
      toolbar = document.createElement('div');
      toolbar.className = `${ppfx}rte-toolbar ${ppfx}one-bg`;
      this.initRte(document.createElement('div'));

      //Avoid closing on toolbar clicking
      on(toolbar, 'mousedown', e => e.stopPropagation());
      return this;
    },

    destroy() {
      this.globalRte?.destroy();
      this.customRte?.destroy?.();
      toolbar = 0;
      ['actionbar', 'actions', 'em', 'config', 'globalRte', 'lastEl'].map(i => {
        delete this[i];
      });
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
      let { globalRte } = this;
      const { em, pfx, actionbar, config } = this;
      const actionbarContainer = toolbar;
      const actions = this.actions || [...config.actions];
      const classes = {
        actionbar: `${pfx}actionbar`,
        button: `${pfx}action`,
        active: `${pfx}active`,
        inactive: `${pfx}inactive`,
        disabled: `${pfx}disabled`,
      };

      if (!globalRte) {
        globalRte = new RichTextEditor({
          em,
          el,
          classes,
          actions,
          actionbar,
          actionbarContainer,
        });
        this.globalRte = globalRte;
      } else {
        globalRte.em = em;
        globalRte.setEl(el);
      }

      if (globalRte.actionbar) {
        this.actionbar = globalRte.actionbar;
      }

      if (globalRte.actions) {
        this.actions = globalRte.actions;
      }

      return globalRte;
    },

    /**
     * Add a new action to the built-in RTE toolbar
     * @param {string} name Action name
     * @param {Object} action Action options
     * @example
     * rte.add('bold', {
     *   icon: '<b>B</b>',
     *   attributes: {title: 'Bold'},
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
     * // An example with state
     * const isValidAnchor = (rte) => {
     *   // a utility function to help determine if the selected is a valid anchor node
     *   const anchor = rte.selection().anchorNode;
     *   const parentNode  = anchor && anchor.parentNode;
     *   const nextSibling = anchor && anchor.nextSibling;
     *   return (parentNode && parentNode.nodeName == 'A') || (nextSibling && nextSibling.nodeName == 'A')
     * }
     * rte.add('toggleAnchor', {
     *   icon: `<span style="transform:rotate(45deg)">&supdsub;</span>`,
     *   state: (rte, doc) => {
     *    if (rte && rte.selection()) {
     *      // `btnState` is a integer, -1 for disabled, 0 for inactive, 1 for active
     *      return isValidAnchor(rte) ? btnState.ACTIVE : btnState.INACTIVE;
     *    } else {
     *      return btnState.INACTIVE;
     *    }
     *   },
     *   result: (rte, action) => {
     *     if (isValidAnchor(rte)) {
     *       rte.exec('unlink');
     *     } else {
     *       rte.insertHTML(`<a class="link" href="">${rte.selection()}</a>`);
     *     }
     *   }
     * })
     */
    add(name, action = {}) {
      action.name = name;
      this.globalRte?.addAction(action, { sync: 1 });
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
      this.globalRte?.getActions().forEach(action => {
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
      return this.globalRte?.getActions();
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
    updatePosition() {
      const { em } = this;
      const un = 'px';
      const canvas = em.get('Canvas');
      const { style } = toolbar;
      const pos = canvas.getTargetToElementFixed(this.lastEl, toolbar, {
        event: 'rteToolbarPosUpdate',
        left: 0,
      });
      style.top = (pos.top || 0) + un;
      style.left = (pos.left || 0) + un;
    },

    /**
     * Enable rich text editor on the element
     * @param {View} view Component view
     * @param {Object} rte The instance of already defined RTE
     * @private
     * */
    async enable(view, rte, opts) {
      this.lastEl = view.el;
      const { customRte, em } = this;
      const el = view.getChildrenContainer();

      toolbar.style.display = '';
      const rteInst = await (customRte ? customRte.enable(el, rte) : this.initRte(el).enable(opts));

      if (em) {
        setTimeout(this.updatePosition.bind(this), 0);
        em.off(eventsUp, this.updatePosition, this);
        em.on(eventsUp, this.updatePosition, this);
        em.trigger('rte:enable', view, rteInst);
      }

      return rteInst;
    },

    /**
     * Unbind rich text editor from the element
     * @param {View} view
     * @param {Object} rte The instance of already defined RTE
     * @private
     * */
    disable(view, rte) {
      const { em } = this;
      const customRte = this.customRte;
      var el = view.getChildrenContainer();

      if (customRte) {
        customRte.disable(el, rte);
      } else {
        rte && rte.disable();
      }

      hideToolbar();
      if (em) {
        em.off(eventsUp, this.updatePosition, this);
        em.trigger('rte:disable', view, rte);
      }
    },
  };
};
