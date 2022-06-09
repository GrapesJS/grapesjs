import defaults from './config/config';

export default config => {
  var c = config || {};

  // Set default options
  for (var name in defaults) {
    if (!(name in c)) c[name] = defaults[name];
  }

  var plugins = {};

  return {
    /**
     * Add new plugin. Plugins could not be overwritten
     * @param {string} id Plugin ID
     * @param {Function} plugin Function which contains all plugin logic
     * @return {Function} The plugin function
     * @example
     * PluginManager.add('some-plugin', function(editor){
     *   editor.Commands.add('new-command', {
     *     run:  function(editor, senderBtn){
     *       console.log('Executed new-command');
     *     }
     *   })
     * });
     */
    add(id, plugin) {
      if (plugins[id]) {
        return plugins[id];
      }

      plugins[id] = plugin;
      return plugin;
    },

    /**
     * Returns plugin by ID
     * @param  {string} id Plugin ID
     * @return {Function|undefined} Plugin
     * @example
     * var plugin = PluginManager.get('some-plugin');
     * plugin(editor);
     */
    get(id) {
      return plugins[id];
    },

    /**
     * Returns object with all plugins
     * @return {Object}
     */
    getAll() {
      return plugins;
    },
  };
};
