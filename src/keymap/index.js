import { defaults, isString } from 'underscore';
const keymaster = require('keymaster').noConflict();

module.exports = () => {
  let config;
  const configDef = {};
  const keymaps = {};

  return {

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
      config = opts;
      defaults(config, configDef);
      this.em = config.em;
      return this;
    },

    /**
     * Add new keymap
     * @param {string} id Keymap id
     * @param {string} keys Keymap keys, eg. '⌘+z, ctrl+z'
     * @param {Function|string} handler Keymap handler, might be a function
     *  or just a command id as a string
     * @example
     * keymaps.add('ns:my-keymap', '⌘+s, ctrl+s', () => {
     *  console.log('do stuff');
     * });
     * // or
     * keymaps.add('ns:my-keymap', '⌘+s, ctrl+s', 'some-gjs-command');
     */
    add(id, keys, handler) {
      const em = this.em;
      const cmd = em.get('Commands');
      const keymap = { keys, handler };
      const pk = keymaps[id];
      pk && this.remove(id);
      keymaps[id] = keymap;
      keymaster(keys, id, () => {
        handler = isString(handler) ? cmd.get(handler) : handler;
        handler(em.getEditor());
        em.trigger(`keymap:emit`, id, keymap);
        em.trigger(`keymap:emit:${id}`, keymap);
        console.log('executed', id);
      });
      em.trigger('keymap:add', id, keymap);
      // emit
      //keymaster.unbind(keys, id);
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
        keymaster.unbind(keymap.keys, id);
        em && em.trigger('keymap:remove', id, keymap);
        return keymap;
      }
    },


  };
};
