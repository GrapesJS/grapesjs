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
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const rte = editor.RichTextEditor;
 * ```
 *
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [remove](#remove)
 * * [getToolbarEl](#gettoolbarel)
 *
 * @module RichTextEditor
 */

import RichTextEditor from './model/RichTextEditor';
import { on, off } from 'utils/mixins';
import defaults from './config/config';

export default () => {
  let config = {};
  let toolbar, actions, lastEl, lastElPos, globalRte;
  const eventsUp =
    'change:canvasOffset canvasScroll frame:scroll component:update';
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
      return config;
    },

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} opts Options
     * @private
     */
    init(opts = {}) {
      config = {
        ...defaults,
        ...opts
      };
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

    destroy() {
      const { customRte } = this;
      globalRte && globalRte.destroy();
      customRte && customRte.destroy && customRte.destroy();
      this.actionbar = 0;
      this.actions = 0;
      [config, toolbar, actions, lastEl, lastElPos, globalRte].forEach(
        i => (i = {})
      );
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
      const actions = this.actions || [...config.actions];
      const classes = {
        actionbar: `${pfx}actionbar`,
        button: `${pfx}action`,
        active: `${pfx}active`,
        inactive: `${pfx}inactive`,
        disabled: `${pfx}disabled`
      };
      const rte = new RichTextEditor({
        el,
        classes,
        actions,
        actionbar,
        actionbarContainer
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
      globalRte.addAction(action, { sync: 1 });
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
    updatePosition() {
      const un = 'px';
      const canvas = config.em.get('Canvas');
      const { style } = toolbar;
      const pos = canvas.getTargetToElementFixed(lastEl, toolbar, {
        event: 'rteToolbarPosUpdate'
      });

      style.top = pos.top + un;
      style.left = 0 + un;
    },

    /**
     * Enable rich text editor on the element
     * @param {View} view Component view
     * @param {Object} rte The instance of already defined RTE
     * @private
     * */
    async enable(view, rte) {
      lastEl = view.el;
      const { customRte } = this;
      const canvas = config.em.get('Canvas');
      const em = config.em;
      const el = view.getChildrenContainer();
      lastElPos = canvas.getElementPos(lastEl);

      toolbar.style.display = '';
      const rteInst = await (customRte
        ? customRte.enable(el, rte)
        : this.initRte(el).enable());

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
      const em = config.em;
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
    }
  };
};
