/**{START_EVENTS}*/
export enum KeymapsEvents {
  /**
   * @event `keymap:add` New keymap added. The new keymap object is passed as an argument to the callback.
   * @example
   * editor.on('keymap:add', (keymap) => { ... });
   */
  add = 'keymap:add',

  /**
   * @event `keymap:remove` Keymap removed. The removed keymap object is passed as an argument to the callback.
   * @example
   * editor.on('keymap:remove', (keymap) => { ... });
   */
  remove = 'keymap:remove',

  /**
   * @event `keymap:emit` Some keymap emitted. The keymapId, shortcutUsed, and Event are passed as arguments to the callback.
   * @example
   * editor.on('keymap:emit', (keymapId, shortcutUsed, event) => { ... });
   */
  emit = 'keymap:emit',
  emitId = 'keymap:emit:',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default KeymapsEvents;
