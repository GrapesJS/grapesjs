/**
 *
 * * [add](#add)
 * * [get](#get)
 * * [has](#has)
 *
 * You can init the editor with all necessary commands via configuration
 *
 * ```js
 * var editor = grapesjs.init({
 * 	...
 *  commands: {...} // Check below for the properties
 * 	...
 * });
 * ```
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var commands = editor.Commands;
 * ```
 *
 * @module Commands
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.defaults=[]] Array of possible commands
 * @example
 * ...
 * commands: {
 * 	defaults: [{
 * 		id: 'helloWorld',
 * 		run:  function(editor, sender){
 * 			alert('Hello world!');
 * 		},
 * 		stop:  function(editor, sender){
 * 			alert('Stop!');
 * 		},
 * 	}],
 * },
 * ...
 */

module.exports = () => {
  var c = {},
  commands = {},
  defaultCommands = {},
  defaults = require('./config/config'),
  AbsCommands = require('./view/CommandAbstract');

  // Need it here as it would be used below
  var add = function(id, obj){
    delete obj.initialize;
    commands[id] = AbsCommands.extend(obj);
    return this;
  };

  return {

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'Commands',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @private
     */
    init(config) {
      c = config || {};
      for (var name in defaults) {
        if (!(name in c))
          c[name] = defaults[name];
      }

      var ppfx = c.pStylePrefix;
      if(ppfx)
        c.stylePrefix = ppfx + c.stylePrefix;

      // Load commands passed via configuration
      for( var k in c.defaults) {
        var obj = c.defaults[k];
        if(obj.id)
          this.add(obj.id, obj);
      }

      defaultCommands['select-comp'] = require('./view/SelectComponent');
      defaultCommands['create-comp'] = require('./view/CreateComponent');
      defaultCommands['delete-comp'] = require('./view/DeleteComponent');
      defaultCommands['image-comp'] = require('./view/ImageComponent');
      defaultCommands['move-comp'] = require('./view/MoveComponent');
      defaultCommands['text-comp'] = require('./view/TextComponent');
      defaultCommands['insert-custom'] = require('./view/InsertCustom');
      defaultCommands['export-template'] = require('./view/ExportTemplate');
      defaultCommands['sw-visibility'] = require('./view/SwitchVisibility');
      defaultCommands['open-layers'] = require('./view/OpenLayers');
      defaultCommands['open-sm'] = require('./view/OpenStyleManager');
      defaultCommands['open-tm'] = require('./view/OpenTraitManager');
      defaultCommands['open-blocks'] = require('./view/OpenBlocks');
      defaultCommands['open-assets'] = require('./view/OpenAssets');
      defaultCommands['show-offset'] = require('./view/ShowOffset');
      defaultCommands.fullscreen = require('./view/Fullscreen');
      defaultCommands.preview = require('./view/Preview');
      defaultCommands.resize = require('./view/Resize');
      defaultCommands.drag = require('./view/Drag');

      defaultCommands['tlb-delete'] = {
        run(ed) {
          var sel = ed.getSelected();

          if(!sel || !sel.get('removable')) {
            console.warn('The element is not removable');
            return;
          }

          sel.set('status', '');
          sel.destroy();
          ed.trigger('component:update', sel);
          ed.editor.set('selectedComponent', null);
        },
      };

      defaultCommands['tlb-clone'] = {
        run(ed) {
          var sel = ed.getSelected();

          if(!sel || !sel.get('copyable')) {
            console.warn('The element is not clonable');
            return;
          }

          var collection = sel.collection;
          var index = collection.indexOf(sel);
          collection.add(sel.clone(), {at: index + 1});
          ed.trigger('component:update', sel);
        },
      };

      defaultCommands['tlb-move'] = {
        run(ed, sender, opts) {
          var sel = ed.getSelected();
          var dragger;

          if(!sel || !sel.get('draggable')) {
            console.warn('The element is not draggable');
            return;
          }

          const onStart = (e, opts) => {
            console.log('start mouse pos ', opts.start);
            console.log('el rect ', opts.elRect);
            var el = opts.el;
            el.style.position = 'absolute';
            el.style.margin = 0;
          };

          const onEnd = (e, opts) => {
            em.runDefault();
            em.set('selectedComponent', sel);
            ed.trigger('component:update', sel);
            dragger && dragger.blur();
          };

          const onDrag = (e, opts) => {
            console.log('Delta ', opts.delta);
            console.log('Current ', opts.current);
          };

          var toolbarEl = ed.Canvas.getToolbarEl();
          toolbarEl.style.display = 'none';
          var em = ed.getModel();
          em.stopDefault();

          if (em.get('designerMode')) {
            // TODO move grabbing func in editor/canvas from the Sorter
            dragger = editor.runCommand('drag', {
              el: sel.view.el,
              options: {
                event: opts && opts.event,
                onStart,
                onDrag,
                onEnd
              }
            });
          } else {
            var cmdMove = ed.Commands.get('move-comp');
            cmdMove.onEndMoveFromModel = onEnd;
            cmdMove.initSorterFromModel(sel);
          }


          sel.set('status', 'selected');
        },
      };

      if(c.em)
        c.model = c.em.get('Canvas');

      return this;
    },

    /**
     * On load callback
     * @private
     */
    onLoad() {
    	this.loadDefaultCommands();
    },

    /**
     * Add new command to the collection
     * @param	{string} id Command's ID
     * @param	{Object} command Object representing you command. Methods `run` and `stop` are required
     * @return {this}
     * @example
     * commands.add('myCommand', {
     * 	run:  function(editor, sender){
     * 		alert('Hello world!');
     * 	},
     * 	stop:  function(editor, sender){
     * 	},
     * });
     * */
    add,

    /**
     * Get command by ID
     * @param	{string}	id Command's ID
     * @return {Object} Object representing the command
     * @example
     * var myCommand = commands.get('myCommand');
     * myCommand.run();
     * */
    get(id) {
      var el = commands[id];

      if(typeof el == 'function'){
        el = new el(c);
        commands[id]	= el;
      }

      return el;
    },

    /**
     * Check if command exists
     * @param	{string}	id Command's ID
     * @return {Boolean}
     * */
    has(id) {
      return !!commands[id];
    },

    /**
     * Load default commands
     * @return {this}
     * @private
     * */
    loadDefaultCommands() {
      for (var id in defaultCommands) {
        this.add(id, defaultCommands[id]);
      }

      return this;
    },
  };

};
