 module.exports = (config => {
  var c = config || {},
  defaults = require('./config/config'),
  Editor = require('editor'),
  PluginManager = require('plugin_manager');

  var plugins = new PluginManager();
  var editors = [];

  return {

    editors,

    plugins,

    /**
     * Initializes an editor based on passed options
     * @param {Object} config Configuration object
     * @param {string} config.container Selector which indicates where render the editor
     * @param {Object|string} config.components='' HTML string or Component model in JSON format
     * @param {Object|string} config.style='' CSS string or CSS model in JSON format
     * @param {Boolean} [config.fromElement=false] If true, will fetch HTML and CSS from selected container
     * @param {Boolean} [config.copyPaste=true] Enable/Disable the possibility to copy(ctrl+c) & paste(ctrl+v) components
     * @param {Boolean} [config.undoManager=true] Enable/Disable undo manager
     * @param {Array} [config.plugins=[]] Array of plugins to execute on start
     * @return {grapesjs.Editor} GrapesJS editor instance
     * @example
     * var editor = grapesjs.init({
     *   container: '#myeditor',
     *   components: '<article class="hello">Hello world</article>',
     *   style: '.hello{color: red}',
     * })
     */
    init(config) {
      var c = config || {};
      var els = c.container;

      // Make a missing $ more verbose
      if (typeof $ == 'undefined') {
        throw 'jQuery not found';
      }

      // Set default options
      for (var name in defaults) {
        if (!(name in c))
          c[name] = defaults[name];
      }

      if(!els)
        throw new Error("'container' is required");

      c.el = document.querySelector(els);
      var editor = new Editor(c).init();

      // Execute plugins
      var plugs = plugins.getAll();

      c.plugins.forEach((pluginId) => {
        let plugin = plugins.get(pluginId);

        if (plugin) {
          plugin(editor, c.pluginsOpts[pluginId] || {});
        } else {
          console.warn(`Plugin ${pluginId} not found`);
        }
      });

      if(c.autorender)
        editor.render();

      editors.push(editor);
      return editor;
    },

  };

})();
