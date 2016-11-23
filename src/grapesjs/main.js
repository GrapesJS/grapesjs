define(function (require) {

   return function(config) {

    var c = config || {},
    defaults = require('./config/config'),
    Editor = require('editor/main'),
    PluginManager = require('PluginManager');

    var plugins = new PluginManager();
    var editors = [];

    return {

      editors: editors,

      plugins: plugins,

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
      init: function(config) {
        var c = config || {};
        var els = c.container;

        // Set default options
        for (var name in defaults) {
          if (!(name in c))
            c[name] = defaults[name];
        }

        if(!els)
          throw new Error("'container' is required");

        if(c.noticeOnUnload)
          window.onbeforeunload = function(e) {
            return 1;
          };

        c.el = document.querySelector(els);
        var editor = new Editor(c).init();

        // Execute all plugins
        var plugs = plugins.getAll();
        for (var id in plugs){
          // Check if plugin is requested
          if(c.plugins.indexOf(id) < 0)
            continue;

          var opts = c.pluginsOpts[id] || {};
          var plug = plugins.get(id);
          plug(editor, opts);
        }

        if(c.autorender)
          editor.render();

        editors.push(editor);
        return editor;
      },

    };

  }();

});
