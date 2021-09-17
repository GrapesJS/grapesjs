/**
 * You can customize the initial state of the module from the editor initialization
 * ```js
 * const editor = grapesjs.init({
 *  keymaps: {
 *     // Object of keymaps
 *    defaults: {
 *      'your-namespace:keymap-name' {
 *        keys: '⌘+z, ctrl+z',
 *        handler: 'some-command-id'
 *      },
 *      ...
 *    }
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const keymaps = editor.Keymaps;
 * ```
 *
 * * [getConfig](#getconfig)
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getAll)
 * * [remove](#remove)
 * * [removeAll](#removeall)
 *
 * @module Keymaps
 */

import { isString } from 'underscore';
import { hasWin } from 'utils/mixins';
import keymaster from 'utils/keymaster';

hasWin() && keymaster.init(window);

export default () => {
  let em;
  let config;
  const keymaps = {};
  const configDef = {
    defaults: {
      'core:undo': {
        keys: '⌘+z, ctrl+z',
        handler: 'core:undo'
      },
      'core:redo': {
        keys: '⌘+shift+z, ctrl+shift+z',
        handler: 'core:redo'
      },
      'core:copy': {
        keys: '⌘+c, ctrl+c',
        handler: 'core:copy'
      },
      'core:paste': {
        keys: '⌘+v, ctrl+v',
        handler: 'core:paste'
      },
      'core:component-next': {
        keys: 's',
        handler: 'core:component-next'
      },
      'core:component-prev': {
        keys: 'w',
        handler: 'core:component-prev'
      },
      'core:component-enter': {
        keys: 'd',
        handler: 'core:component-enter'
      },
      'core:component-exit': {
        keys: 'a',
        handler: 'core:component-exit'
      },
      'core:component-delete': {
        keys: 'backspace, delete',
        handler: 'core:component-delete',
        opts: { prevent: 1 }
      }
    }
  };

  return {
    keymaster,

    name: 'Keymaps',

    /**
     * Get module configurations
     * @return {Object} Configuration object
     */
    getConfig() {
      return config;
    },

    /**
     * Initialize module
     * @param {Object} config Configurations
     * @private
     */
    init(opts = {}) {
      config = { ...configDef, ...opts };
      em = config.em;
      this.em = em;
      return this;
    },

    onLoad() {
      const defKeys = config.defaults;

      for (let id in defKeys) {
        const value = defKeys[id];
        this.add(id, value.keys, value.handler, value.opts || {});
      }
    },

    /**
     * Add new keymap
     * @param {string} id Keymap id
     * @param {string} keys Keymap keys, eg. `ctrl+a`, `⌘+z, ctrl+z`
     * @param {Function|string} handler Keymap handler, might be a function
     * @param {Object} [opts={}] Options
     * @return {Object} Added keymap
     *  or just a command id as a string
     * @example
     * // 'ns' is just a custom namespace
     * keymaps.add('ns:my-keymap', '⌘+j, ⌘+u, ctrl+j, alt+u', editor => {
     *  console.log('do stuff');
     * });
     * // or
     * keymaps.add('ns:my-keymap', '⌘+s, ctrl+s', 'some-gjs-command');
     *
     * // listen to events
     * editor.on('keymap:emit', (id, shortcut, e) => {
     *  // ...
     * })
     */
    add(id, keys, handler, opts = {}) {
      const { em } = this;
      const cmd = em.get('Commands');
      const editor = em.getEditor();
      const canvas = em.get('Canvas');
      const keymap = { id, keys, handler };
      const pk = keymaps[id];
      pk && this.remove(id);
      keymaps[id] = keymap;
      keymaster(keys, (e, h) => {
        // It's safer putting handlers resolution inside the callback
        const opt = { event: e, h };
        handler = isString(handler) ? cmd.get(handler) : handler;
        const ableTorun = !em.isEditing() && !editor.Canvas.isInputFocused();
        if (ableTorun || opts.force) {
          opts.prevent && canvas.getCanvasView().preventDefault(e);
          typeof handler == 'object'
            ? cmd.runCommand(handler, opt)
            : handler(editor, 0, opt);
          const args = [id, h.shortcut, e];
          em.trigger('keymap:emit', ...args);
          em.trigger(`keymap:emit:${id}`, ...args);
        }
      });
      em.trigger('keymap:add', keymap);
      return keymap;
    },

    /**
     * Get the keymap by id
     * @param {string} id Keymap id
     * @return {Object} Keymap object
     * @example
     * keymaps.get('ns:my-keymap');
     * // -> {keys, handler};
     */
    get(id) {
      return keymaps[id];
    },

    /**
     * Get all keymaps
     * @return {Object}
     * @example
     * keymaps.getAll();
     * // -> {id1: {}, id2: {}};
     */
    getAll() {
      return keymaps;
    },

    /**
     * Remove the keymap by id
     * @param {string} id Keymap id
     * @return {Object} Removed keymap
     * @example
     * keymaps.remove('ns:my-keymap');
     * // -> {keys, handler};
     */
    remove(id) {
      const em = this.em;
      const keymap = this.get(id);

      if (keymap) {
        delete keymaps[id];
        keymap.keys.split(', ').forEach(k => keymaster.unbind(k.trim()));
        em && em.trigger('keymap:remove', keymap);
        return keymap;
      }
    },

    /**
     * Remove all binded keymaps
     * @return {this}
     */
    removeAll() {
      Object.keys(keymaps).forEach(keymap => this.remove(keymap));
      return this;
    },

    destroy() {
      this.removeAll();
      [em, config, keymaps].forEach(i => (i = {}));
      this.em = {};
    }
  };
};
