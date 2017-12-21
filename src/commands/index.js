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
import { isFunction } from 'underscore';

module.exports = () => {
  let em;
  var c = {},
  commands = {},
  defaultCommands = {},
  defaults = require('./config/config'),
  AbsCommands = require('./view/CommandAbstract');

  // Need it here as it would be used below
  var add = function(id, obj) {
    if (isFunction(obj)) {
      obj = { run: obj };
    }

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
      em = c.em;
      var ppfx = c.pStylePrefix;
      if(ppfx)
        c.stylePrefix = ppfx + c.stylePrefix;

      // Load commands passed via configuration
      for( var k in c.defaults) {
        var obj = c.defaults[k];
        if(obj.id)
          this.add(obj.id, obj);
      }

      const ViewCode = require('./view/ExportTemplate');
      defaultCommands['select-comp'] = require('./view/SelectComponent');
      defaultCommands['create-comp'] = require('./view/CreateComponent');
      defaultCommands['delete-comp'] = require('./view/DeleteComponent');
      defaultCommands['image-comp'] = require('./view/ImageComponent');
      defaultCommands['move-comp'] = require('./view/MoveComponent');
      defaultCommands['text-comp'] = require('./view/TextComponent');
      defaultCommands['insert-custom'] = require('./view/InsertCustom');
      defaultCommands['export-template'] = ViewCode;
      defaultCommands['sw-visibility'] = require('./view/SwitchVisibility');
      defaultCommands['open-layers'] = require('./view/OpenLayers');
      defaultCommands['open-sm'] = require('./view/OpenStyleManager');
      defaultCommands['open-tm'] = require('./view/OpenTraitManager');
      defaultCommands['open-blocks'] = require('./view/OpenBlocks');
      defaultCommands['open-assets'] = require('./view/OpenAssets');
      defaultCommands['show-offset'] = require('./view/ShowOffset');
      defaultCommands['select-parent'] = require('./view/SelectParent');
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

          ed.select(null);
          sel.destroy();
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
          sel.emitUpdate()
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
            sel.emitUpdate()
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

      // Core commands
      defaultCommands['core:undo'] = e => e.UndoManager.undo();
      defaultCommands['core:redo'] = e => e.UndoManager.redo();
      defaultCommands['core:canvas-clear'] = e => {
        e.DomComponents.clear();
        e.CssComposer.clear();
      };
      defaultCommands['core:copy'] = ed => {
        const em = ed.getModel();
        const model = ed.getSelected();

        if (model && model.get('copyable') && !ed.Canvas.isInputFocused()) {
          em.set('clipboard', model);
        }
      };
      defaultCommands['core:paste'] = ed => {
        const em = ed.getModel();
        const clp = em.get('clipboard');
        const model = ed.getSelected();
        const coll = model && model.collection;

        if (coll && clp && !ed.Canvas.isInputFocused()) {
          const at = coll.indexOf(model) + 1;
          coll.add(clp.clone(), { at });
        }
      };

      if(c.em)
        c.model = c.em.get('Canvas');

      this.loadDefaultCommands()

      return this;
    },

    /**
     * Add new command to the collection
     * @param	{string} id Command's ID
     * @param	{Object|Function} command Object representing your command,
     *  By passing just a function it's intended as a stateless command
     *  (just like passing an object with only `run` method).
     * @return {this}
     * @example
     * commands.add('myCommand', {
     * 	run(editor, sender) {
     * 		alert('Hello world!');
     * 	},
     * 	stop(editor, sender) {
     * 	},
     * });
     * // As a function
     * commands.add('myCommand2', editor => { ... });
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
