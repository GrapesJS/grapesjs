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
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance.
 *
 * ```js
 * const keymaps = editor.Keymaps;
 * ```
 *
 * {REPLACE_EVENTS}
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

import { isFunction, isString } from 'underscore';
import { Module } from '../abstract';
import EditorModel from '../editor/model/Editor';
import keymaster from '../utils/keymaster';
import { hasWin } from '../utils/mixins';
import defConfig, { Keymap, KeymapOptions, KeymapsConfig } from './config';
import { KeymapsEvents } from './types';

export type KeymapEvent = `${KeymapsEvents}`;

hasWin() && keymaster.init(window);

export default class KeymapsModule extends Module<KeymapsConfig & { name?: string }> {
  keymaster: any = keymaster;
  keymaps: Record<string, Keymap>;
  events = KeymapsEvents;

  constructor(em: EditorModel) {
    super(em, 'Keymaps', defConfig());
    this.keymaps = {};
  }

  onLoad() {
    if (this.em.isHeadless) return;
    const defKeys = this.config.defaults;

    for (let id in defKeys) {
      const value = defKeys[id];
      this.add(id, value.keys, value.handler, value.opts || {});
    }
  }

  /**
   * Get configuration object
   * @name getConfig
   * @function
   * @return {Object}
   */

  /**
   * Add new keymap
   * @param {string} id Keymap id
   * @param {string} keys Keymap keys, eg. `ctrl+a`, `⌘+z, ctrl+z`
   * @param {Function|string} handler Keymap handler, might be a function
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.force=false] Force the handler to be executed.
   * @param {Boolean} [opts.prevent=false] Prevent default of the original triggered event.
   * @returns {Object} Added keymap
   * @example
   * // 'ns' is just a custom namespace
   * keymaps.add('ns:my-keymap', '⌘+j, ⌘+u, ctrl+j, alt+u', editor => {
   *  console.log('do stuff');
   * });
   * // or
   * keymaps.add('ns:my-keymap', '⌘+s, ctrl+s', 'some-gjs-command', {
   *  // Prevent the default browser action
   *  prevent: true,
   * });
   *
   * // listen to events
   * editor.on('keymap:emit', (id, shortcut, event) => {
   *  // ...
   * })
   */
  add(id: Keymap['id'], keys: Keymap['keys'], handler: Keymap['handler'], opts: KeymapOptions = {}) {
    const { em, events } = this;
    const cmd = em.Commands;
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
          opts.prevent && canvas.getCanvasView()?.preventDefault(e);
          isFunction(handlerRes) ? handlerRes(editor, 0, opt) : cmd.runCommand(handlerRes, opt);
          const args = [id, h.shortcut, e];
          em.trigger(events.emit, ...args);
          em.trigger(`${events.emitId}${id}`, ...args);
        }
      },
      undefined,
    );
    em.trigger(events.add, keymap);
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
    const { em, events } = this;
    const keymap = this.get(id);

    if (keymap) {
      delete this.keymaps[id];
      keymap.keys.split(', ').forEach((k) => {
        // @ts-ignore
        keymaster.unbind(k.trim());
      });
      em?.trigger(events.remove, keymap);
      return keymap;
    }
  }

  /**
   * Remove all binded keymaps
   * @return {this}
   */
  removeAll() {
    Object.keys(this.keymaps).forEach((keymap) => this.remove(keymap));
    keymaster.handlers = {};
    return this;
  }

  destroy() {
    this.removeAll();
    this.keymaps = {};
  }
}
