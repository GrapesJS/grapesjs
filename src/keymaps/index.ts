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
 * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
 *
 * ```js
 * // Listen to events
 * editor.on('keymap:add', () => { ... });
 *
 * // Use the API
 * const keymaps = editor.Keymaps;
 * keymaps.add(...);
 * ```
 *
 * ## Available Events
 * * `keymap:add` - New keymap added. The new keyamp object is passed as an argument
 * * `keymap:remove` - Keymap removed. The removed keyamp object is passed as an argument
 * * `keymap:emit` - Some keymap emitted, in arguments you get keymapId, shortcutUsed, Event
 * * `keymap:emit:{keymapId}` - `keymapId` emitted, in arguments you get keymapId, shortcutUsed, Event
 *
 * ## Methods
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
import { hasWin, isObject } from '../utils/mixins';
import keymaster from '../utils/keymaster';
import { Module } from '../abstract';
import EditorModel from '../editor/model/Editor';
import defaults, { Keymap, KeymapOptions, KeymapsConfig } from './config';

hasWin() && keymaster.init(window);

export default class KeymapsModule extends Module<KeymapsConfig & { name?: string }> {
  keymaster = keymaster;
  keymaps: Record<string, Keymap>;

  constructor(em: EditorModel) {
    super(em, 'Keymaps', defaults);
    this.keymaps = {};
  }

  /**
   * Get module configurations
   * @return {Object} Configuration object
   */
  getConfig() {
    return this.config;
  }

  onLoad() {
    const defKeys = this.config.defaults;

    for (let id in defKeys) {
      const value = defKeys[id];
      this.add(id, value.keys, value.handler, value.opts || {});
    }
  }

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
  add(id: Keymap['id'], keys: Keymap['keys'], handler: Keymap['handler'], opts: KeymapOptions = {}) {
    const { em } = this;
    const cmd = em.get('Commands');
    const editor = em.getEditor();
    const canvas = em.Canvas;
    const keymap: Keymap = { id, keys, handler };
    const pk = this.keymaps[id];
    pk && this.remove(id);
    this.keymaps[id] = keymap;
    keymaster(
      keys,
      (e: any, h: any) => {
        // It's safer putting handlers resolution inside the callback
        const opt = { event: e, h };
        const handlerRes = isString(handler) ? cmd.get(handler) : handler;
        const ableTorun = !em.isEditing() && !editor.Canvas.isInputFocused();
        if (ableTorun || opts.force) {
          opts.prevent && canvas.getCanvasView().preventDefault(e);
          isObject(handlerRes) ? cmd.runCommand(handlerRes, opt) : handlerRes(editor, 0, opt);
          const args = [id, h.shortcut, e];
          em.trigger('keymap:emit', ...args);
          em.trigger(`keymap:emit:${id}`, ...args);
        }
      },
      undefined
    );
    em.trigger('keymap:add', keymap);
    return keymap;
  }

  /**
   * Get the keymap by id
   * @param {string} id Keymap id
   * @return {Object} Keymap object
   * @example
   * keymaps.get('ns:my-keymap');
   * // -> {keys, handler};
   */
  get(id: string) {
    return this.keymaps[id];
  }

  /**
   * Get all keymaps
   * @return {Object}
   * @example
   * keymaps.getAll();
   * // -> {id1: {}, id2: {}};
   */
  getAll() {
    return this.keymaps;
  }

  /**
   * Remove the keymap by id
   * @param {string} id Keymap id
   * @return {Object} Removed keymap
   * @example
   * keymaps.remove('ns:my-keymap');
   * // -> {keys, handler};
   */
  remove(id: string) {
    const { em } = this;
    const keymap = this.get(id);

    if (keymap) {
      delete this.keymaps[id];
      keymap.keys.split(', ').forEach(k => {
        // @ts-ignore
        keymaster.unbind(k.trim());
      });
      em?.trigger('keymap:remove', keymap);
      return keymap;
    }
  }

  /**
   * Remove all binded keymaps
   * @return {this}
   */
  removeAll() {
    Object.keys(this.keymaps).forEach(keymap => this.remove(keymap));
    keymaster.handlers = {};
    return this;
  }

  destroy() {
    this.removeAll();
    this.keymaps = {};
  }
}
