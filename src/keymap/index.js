import { defaults } from 'underscore';
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
     * @param {Function} handler Keymap handler
     * @example
     * keymaps.add('ns:my-keymap', '⌘+s, ctrl+s', () => {
     *  console.log('do stuff');
     * });
     */
    add(id, keys, handler) {
      const em = this.em;
      const keymap = { keys, handler };
      const pk = keymaps[id];
      pk && this.remove(id);
      keymaps[id] = keymap;
      keymaster(keys, id, handler);
      em && em.trigger('keymap:add', id, keymap);
      // emit
      //keymaster.unbind(keys, id);
    },


    /**
     * Returns the keymap by id
     * @param {string}
     */
    get(id) {
      return keymaps[id];
    },


    /**
     * Return the global collection, containing all the assets
     * @return {Collection}
     */
    getAll() {
      return keymaps;
    },


  };
};
