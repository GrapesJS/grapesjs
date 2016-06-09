define(function (require) {

   return function(config) {

    var c = config || {},
    defaults = require('./config/config'),
    Editor = require('editor/main'),
    PluginManager = require('PluginManager');

    // Set default options
    for (var name in defaults) {
      if (!(name in c))
        c[name] = defaults[name];
    }

    var plugins = new PluginManager();
    var editors = [];

    return {

      plugins: plugins,

      /**
       * Initializes an editor based on passed options
       * @param {Object} config Configuration object
       * @param {string} config.container Selector which indicates where render the editor
       * @param {Object|string} config.components='' HTML string or Component model in JSON format
       * @param {Object|string} config.style='' CSS string or CSS model in JSON format
       * @param {Boolean} [config.copyPaste=true] Enable/Disable the possibility to copy(ctrl+c) & paste(ctrl+v) components
       * @param {Boolean} [config.undoManager=true] Enable/Disable undo manager
       * @param {Array} [config.plugins=[]] Array of plugins to execute on start
       * @return {grapesjs.Editor} GrapesJS Editor instance
       */
      init: function(config) {
        var c = config || {};
        var els = c.container;

        if(!els)
          throw new Error("'container' is required");

        config.el = document.querySelector(els);
        var editor = new Editor(config);

        // Execute all plugins
        var plugs = plugins.getAll();
        for (var id in plugs){
          var plug = plugins.get(id);
          plug(editor);
        }

        if(c.autorender)
          editor.render();

        return editor;
      },

    };
  };

});