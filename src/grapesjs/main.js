define(function(require) {

   return function(config) {

    var c = config || {},
    defaults = require('./config/config');

    // Set default options
    for (var name in defaults) {
      if (!(name in c))
        c[name] = defaults[name];
    }

    var plugins = [];
    /*
    .plugins will be PluginManager
    grapesjs.plugins.add('sheeet', function(editor){
      editor.commands.add('openbar', function(){});
    });
     */
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
        //
        var editor = new Editor(config);
        //- new EditorView({model: editor}).render();
        //- inject and start plugins (plugins)
        // foreach config.plugins
        //  pluginManager.get('plugin')(editor);
        //
        return editor;
      },

    };
  };

});