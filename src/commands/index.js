/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/commands/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  commands: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const commands = editor.Commands;
 * ```
 *
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [extend](#extend)
 * * [has](#has)
 * * [run](#run)
 * * [stop](#stop)
 * * [isActive](#isactive)
 * * [getActive](#getactive)
 *
 * @module Commands
 */

import { isFunction, includes } from 'underscore';
import CommandAbstract from './view/CommandAbstract';
import defaults from './config/config';

export default () => {
  let em;
  let c = {};
  const commands = {};
  const defaultCommands = {};
  const active = {};
  const commandsDef = [
    ['preview', 'Preview', 'preview'],
    ['resize', 'Resize', 'resize'],
    ['fullscreen', 'Fullscreen', 'fullscreen'],
    ['copy', 'CopyComponent'],
    ['paste', 'PasteComponent'],
    ['canvas-move', 'CanvasMove'],
    ['canvas-clear', 'CanvasClear'],
    ['open-code', 'ExportTemplate', 'export-template'],
    ['open-layers', 'OpenLayers', 'open-layers'],
    ['open-styles', 'OpenStyleManager', 'open-sm'],
    ['open-traits', 'OpenTraitManager', 'open-tm'],
    ['open-blocks', 'OpenBlocks', 'open-blocks'],
    ['open-assets', 'OpenAssets', 'open-assets'],
    ['component-select', 'SelectComponent', 'select-comp'],
    ['component-outline', 'SwitchVisibility', 'sw-visibility'],
    ['component-offset', 'ShowOffset', 'show-offset'],
    ['component-move', 'MoveComponent', 'move-comp'],
    ['component-next', 'ComponentNext'],
    ['component-prev', 'ComponentPrev'],
    ['component-enter', 'ComponentEnter'],
    ['component-exit', 'ComponentExit', 'select-parent'],
    ['component-delete', 'ComponentDelete'],
    ['component-style-clear', 'ComponentStyleClear'],
    ['component-drag', 'ComponentDrag']
  ];

  // Need it here as it would be used below
  const add = function(id, obj) {
    if (isFunction(obj)) obj = { run: obj };
    if (!obj.stop) obj.noStop = 1;
    delete obj.initialize;
    obj.id = id;
    commands[id] = CommandAbstract.extend(obj);
    return this;
  };

  return {
    CommandAbstract,

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
    init(config = {}) {
      c = {
        ...defaults,
        ...config
      };
      em = c.em;
      const ppfx = c.pStylePrefix;
      if (ppfx) c.stylePrefix = ppfx + c.stylePrefix;

      // Load commands passed via configuration
      for (let k in c.defaults) {
        const obj = c.defaults[k];
        if (obj.id) this.add(obj.id, obj);
      }

      defaultCommands['tlb-delete'] = {
        run(ed) {
          return ed.runCommand('core:component-delete');
        }
      };

      defaultCommands['tlb-clone'] = {
        run(ed) {
          ed.runCommand('core:copy');
          ed.runCommand('core:paste');
        }
      };

      defaultCommands['tlb-move'] = {
        run(ed, sender, opts = {}) {
          let dragger;
          const em = ed.getModel();
          const event = opts && opts.event;
          const { target } = opts;
          const sel = target || ed.getSelected();
          const selAll = target ? [target] : [...ed.getSelectedAll()];
          const nativeDrag = event && event.type == 'dragstart';
          const defComOptions = { preserveSelected: 1 };
          const modes = ['absolute', 'translate'];
          const mode = sel.get('dmode') || em.get('dmode');
          const hideTlb = () => em.stopDefault(defComOptions);
          selAll.forEach(sel => sel.trigger('disable'));

          if (!sel || !sel.get('draggable')) {
            return em.logWarning('The element is not draggable');
          }

          // Without setTimeout the ghost image disappears
          nativeDrag ? setTimeout(hideTlb, 0) : hideTlb();

          const onEnd = (e, opts) => {
            em.runDefault(defComOptions);
            selAll.forEach(sel => sel.set('status', 'selected'));
            ed.select(selAll);
            sel.emitUpdate();
          };

          if (includes(modes, mode)) {
            // Dirty patch to prevent parent selection on drop
            em.set('_cmpDrag', 1);

            // TODO move grabbing func in editor/canvas from the Sorter
            dragger = ed.runCommand('core:component-drag', {
              guidesInfo: 1,
              mode,
              target: sel,
              onEnd,
              event
            });
          } else {
            if (nativeDrag) {
              event.dataTransfer.setDragImage(sel.view.el, 0, 0);
              //sel.set('status', 'freezed');
            }

            const cmdMove = ed.Commands.get('move-comp');
            cmdMove.onEndMoveFromModel = onEnd;
            cmdMove.initSorterFromModels(selAll);
          }

          selAll.forEach(sel => sel.set('status', 'freezed-selected'));
        }
      };

      // Core commands
      defaultCommands['core:undo'] = e => e.UndoManager.undo();
      defaultCommands['core:redo'] = e => e.UndoManager.redo();
      commandsDef.forEach(item => {
        const oldCmd = item[2];
        const cmd = require(`./view/${item[1]}`).default;
        const cmdName = `core:${item[0]}`;
        defaultCommands[cmdName] = cmd;
        if (oldCmd) {
          defaultCommands[oldCmd] = cmd;
          // Propogate old commands (can be removed once we stop to call old commands)
          ['run', 'stop'].forEach(name => {
            em.on(`${name}:${oldCmd}`, (...args) =>
              em.trigger(`${name}:${cmdName}`, ...args)
            );
          });
        }
      });

      if (c.em) c.model = c.em.get('Canvas');

      this.loadDefaultCommands();

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
      let el = commands[id];

      if (isFunction(el)) {
        el = new el(c);
        commands[id] = el;
      } else if (!el) {
        em.logWarning(`'${id}' command not found`);
      }

      return el;
    },

    /**
     * Extend the command. The command to extend should be defined as an object
     * @param	{string}	id Command's ID
     * @param {Object} Object with the new command functions
     * @returns {this}
     * @example
     * commands.extend('old-command', {
     *  someInnerFunction() {
     *  // ...
     *  }
     * });
     * */
    extend(id, cmd = {}) {
      const command = this.get(id);
      if (command) {
        const cmdObj = {
          ...command.constructor.prototype,
          ...cmd
        };
        this.add(id, cmdObj);
        // Extend also old name commands if exist
        const oldCmd = commandsDef.filter(
          cmd => `core:${cmd[0]}` === id && cmd[2]
        )[0];
        oldCmd && this.add(oldCmd[2], cmdObj);
      }
      return this;
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
     * Get an object containing all the commands
     * @return {Object}
     */
    getAll() {
      return commands;
    },

    /**
     * Execute the command
     * @param {String} id Command ID
     * @param {Object} [options={}] Options
     * @return {*} The return is defined by the command
     * @example
     * commands.run('myCommand', { someOption: 1 });
     */
    run(id, options = {}) {
      return this.runCommand(this.get(id), options);
    },

    /**
     * Stop the command
     * @param {String} id Command ID
     * @param {Object} [options={}] Options
     * @return {*} The return is defined by the command
     * @example
     * commands.stop('myCommand', { someOption: 1 });
     */
    stop(id, options = {}) {
      return this.stopCommand(this.get(id), options);
    },

    /**
     * Check if the command is active. You activate commands with `run`
     * and disable them with `stop`. If the command was created without `stop`
     * method it can't be registered as active
     * @param  {String}  id Command id
     * @return {Boolean}
     * @example
     * const cId = 'some-command';
     * commands.run(cId);
     * commands.isActive(cId);
     * // -> true
     * commands.stop(cId);
     * commands.isActive(cId);
     * // -> false
     */
    isActive(id) {
      return this.getActive().hasOwnProperty(id);
    },

    /**
     * Get all active commands
     * @return {Object}
     * @example
     * console.log(commands.getActive());
     * // -> { someCommand: itsLastReturn, anotherOne: ... };
     */
    getActive() {
      return active;
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

    /**
     * Run command via its object
     * @param  {Object} command
     * @param {Object} options
     * @return {*} Result of the command
     * @private
     */
    runCommand(command, options = {}) {
      let result;

      if (command && command.run) {
        const id = command.id;
        const editor = em.get('Editor');

        if (!this.isActive(id) || options.force || !c.strict) {
          result = command.callRun(editor, options);
          if (id && command.stop && !command.noStop && !options.abort) {
            active[id] = result;
          }
        }
      }

      return result;
    },

    /**
     * Stop the command
     * @param  {Object} command
     * @param {Object} options
     * @return {*} Result of the command
     * @private
     */
    stopCommand(command, options = {}) {
      let result;

      if (command && command.run) {
        const id = command.id;
        const editor = em.get('Editor');

        if (this.isActive(id) || options.force || !c.strict) {
          if (id) delete active[id];
          result = command.callStop(editor, options);
        }
      }

      return result;
    },

    /**
     * Create anonymous Command instance
     * @param {Object} command Command object
     * @return {Command}
     * @private
     * */
    create(command) {
      if (!command.stop) command.noStop = 1;
      const cmd = CommandAbstract.extend(command);
      return new cmd(c);
    }
  };
};
