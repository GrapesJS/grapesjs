/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/GrapesJS/grapesjs/blob/master/src/commands/config/config.ts)
 * ```js
 * const editor = grapesjs.init({
 *  commands: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
 *
 * ```js
 * // Listen to events
 * editor.on('run', () => { ... });
 *
 * // Use the API
 * const commands = editor.Commands;
 * commands.add(...);
 * ```
 *
 * {REPLACE_EVENTS}
 *
 * ## Methods
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
import CommandAbstract, { Command, CommandOptions, CommandObject, CommandFunction } from './view/CommandAbstract';
import defaults, { CommandsConfig } from './config/config';
import { Module } from '../abstract';
import Component, { eventDrag } from '../dom_components/model/Component';
import Editor from '../editor/model/Editor';
import { ObjectAny } from '../common';
import CommandsEvents from './types';

export type CommandEvent = 'run' | 'stop' | `run:${string}` | `stop:${string}` | `abort:${string}`;

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
  ['component-drag', 'ComponentDrag'],
];

const defComOptions = { preserveSelected: 1 };

export const getOnComponentDragStart = (em: Editor) => (data: any) => em.trigger(`${eventDrag}:start`, data);

export const getOnComponentDrag = (em: Editor) => (data: any) => em.trigger(eventDrag, data);

export const getOnComponentDragEnd =
  (em: Editor, targets: Component[], opts: { altMode?: boolean } = {}) =>
  (a: any, b: any, data: any) => {
    targets.forEach((trg) => trg.set('status', trg.get('selectable') ? 'selected' : ''));
    em.setSelected(targets);
    targets[0].emitUpdate();
    em.trigger(`${eventDrag}:end`, data);

    // Defer selectComponent in order to prevent canvas "freeze" #2692
    setTimeout(() => em.runDefault(defComOptions));

    // Dirty patch to prevent parent selection on drop
    (opts.altMode || data.cancelled) && em.set('_cmpDrag', 1);
  };

export default class CommandsModule extends Module<CommandsConfig & { pStylePrefix?: string }> {
  CommandAbstract = CommandAbstract;
  defaultCommands: Record<string, Command> = {};
  commands: Record<string, CommandObject> = {};
  active: Record<string, any> = {};
  events = CommandsEvents;

  /**
   * @private
   */
  constructor(em: Editor) {
    super(em, 'Commands', defaults);
    const { config } = this;
    const ppfx = config.pStylePrefix;
    const { defaultCommands } = this;

    if (ppfx) {
      config.stylePrefix = ppfx + config.stylePrefix;
    }

    // Load commands passed via configuration
    Object.keys(config.defaults!).forEach((k) => {
      const obj = config.defaults![k];
      if (obj.id) this.add(obj.id, obj);
    });

    defaultCommands['tlb-delete'] = {
      run(ed) {
        return ed.runCommand('core:component-delete');
      },
    };

    defaultCommands['tlb-clone'] = {
      run(ed) {
        ed.runCommand('core:copy');
        ed.runCommand('core:paste', { action: 'clone-component' });
      },
    };

    defaultCommands['tlb-move'] = {
      run(ed, s, opts = {}) {
        let dragger;
        const em = ed.getModel();
        const { event } = opts;
        const trg = opts.target as Component | undefined;
        const trgs = Array.isArray(trg) ? trg : trg ? [trg] : [...ed.getSelectedAll()];
        const targets = trgs.map((trg) => trg.delegate?.move?.(trg) || trg).filter(Boolean);
        const target = targets[targets.length - 1] as Component | undefined;
        const nativeDrag = event?.type === 'dragstart';
        const modes = ['absolute', 'translate'];

        if (!target?.get('draggable')) {
          return em.logWarning('The element is not draggable');
        }

        const mode = target.get('dmode') || em.get('dmode');
        const hideTlb = () => em.stopDefault(defComOptions);
        const altMode = includes(modes, mode);
        targets.forEach((trg) => trg.trigger('disable', { fromMove: true }));

        // Without setTimeout the ghost image disappears
        nativeDrag ? setTimeout(hideTlb, 0) : hideTlb();

        const onStart = getOnComponentDragStart(em);
        const onDrag = getOnComponentDrag(em);
        const onEnd = getOnComponentDragEnd(em, targets, { altMode });

        if (altMode) {
          // TODO move grabbing func in editor/canvas from the Sorter
          dragger = ed.runCommand('core:component-drag', {
            guidesInfo: 1,
            mode,
            target,
            onStart,
            onDrag,
            onEnd,
            event,
          });
        } else {
          if (nativeDrag) {
            event.dataTransfer.setDragImage(target.view?.el, 0, 0);
            //sel.set('status', 'freezed');
          }

          const cmdMove = ed.Commands.get('move-comp')!;
          cmdMove.onStart = onStart;
          cmdMove.onDrag = onDrag;
          cmdMove.onEndMoveFromModel = onEnd;
          // @ts-ignore
          cmdMove.initSorterFromModels(targets);
        }

        targets.filter((sel) => sel.get('selectable')).forEach((sel) => sel.set('status', 'freezed-selected'));
      },
    };

    // Core commands
    defaultCommands['core:undo'] = (e) => e.UndoManager.undo();
    defaultCommands['core:redo'] = (e) => e.UndoManager.redo();
    commandsDef.forEach((item) => {
      const oldCmd = item[2];
      const cmd = require(`./view/${item[1]}`).default;
      const cmdName = `core:${item[0]}`;
      defaultCommands[cmdName] = cmd;
      if (oldCmd) {
        defaultCommands[oldCmd] = cmd;
        // Propogate old commands (can be removed once we stop to call old commands)
        ['run', 'stop'].forEach((name) => {
          em.on(`${name}:${oldCmd}`, (...args) => em.trigger(`${name}:${cmdName}`, ...args));
        });
      }
    });

    // @ts-ignore TODO check where it's used
    config.model = em.Canvas;

    for (const id in defaultCommands) {
      this.add(id, defaultCommands[id]);
    }

    return this;
  }

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
  add<T extends ObjectAny = {}>(id: string, command: CommandFunction | CommandObject<any, T>) {
    let result: CommandObject = isFunction(command) ? { run: command } : command;

    if (!result.stop) {
      result.noStop = true;
    }

    delete result.initialize;

    result.id = id;
    this.commands[id] = CommandAbstract.extend(result);

    return this;
  }

  /**
   * Get command by ID
   * @param	{string}	id Command's ID
   * @return {Object} Object representing the command
   * @example
   * var myCommand = commands.get('myCommand');
   * myCommand.run();
   * */
  get(id: string): CommandObject | undefined {
    let command: any = this.commands[id];

    if (isFunction(command)) {
      command = new command(this.config);
      this.commands[id] = command;
    } else if (!command) {
      this.em.logWarning(`'${id}' command not found`);
    }

    return command;
  }

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
  extend(id: string, cmd: CommandObject = {}) {
    const command = this.get(id);

    if (command) {
      const cmdObj = {
        ...command.constructor.prototype,
        ...cmd,
      };
      this.add(id, cmdObj);
      // Extend also old name commands if exist
      const oldCmd = commandsDef.filter((cmd) => `core:${cmd[0]}` === id && cmd[2])[0];
      oldCmd && this.add(oldCmd[2], cmdObj);
    }

    return this;
  }

  /**
   * Check if command exists
   * @param	{string}	id Command's ID
   * @return {Boolean}
   * */
  has(id: string) {
    return !!this.commands[id];
  }

  /**
   * Get an object containing all the commands
   * @return {Object}
   */
  getAll() {
    return this.commands;
  }

  /**
   * Execute the command
   * @param {String} id Command ID
   * @param {Object} [options={}] Options
   * @return {*} The return is defined by the command
   * @example
   * commands.run('myCommand', { someOption: 1 });
   */
  run(id: string, options: CommandOptions = {}) {
    return this.runCommand(this.get(id), options);
  }

  /**
   * Stop the command
   * @param {String} id Command ID
   * @param {Object} [options={}] Options
   * @return {*} The return is defined by the command
   * @example
   * commands.stop('myCommand', { someOption: 1 });
   */
  stop(id: string, options: CommandOptions = {}) {
    return this.stopCommand(this.get(id), options);
  }

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
  isActive(id: string) {
    return this.getActive().hasOwnProperty(id);
  }

  /**
   * Get all active commands
   * @return {Object}
   * @example
   * console.log(commands.getActive());
   * // -> { someCommand: itsLastReturn, anotherOne: ... };
   */
  getActive() {
    return this.active;
  }

  /**
   * Run command via its object
   * @param  {Object} command
   * @param {Object} options
   * @return {*} Result of the command
   * @private
   */
  runCommand(command?: CommandObject, options: CommandOptions = {}) {
    let result;

    if (command && command.run) {
      const { em, config } = this;
      const id = command.id as string;
      const editor = em.Editor;

      if (!this.isActive(id) || options.force || !config.strict) {
        // @ts-ignore
        result = editor && command.callRun(editor, options);

        if (id && command.stop && !command.noStop && !options.abort) {
          this.active[id] = result;
        }
      }
    }

    return result;
  }

  /**
   * Stop the command
   * @param  {Object} command
   * @param {Object} options
   * @return {*} Result of the command
   * @private
   */
  stopCommand(command?: CommandObject, options: CommandOptions = {}) {
    let result;

    if (command && command.run) {
      const { em, config } = this;
      const id = command.id as string;
      const editor = em.Editor;

      if (this.isActive(id) || options.force || !config.strict) {
        if (id) delete this.active[id];
        // @ts-ignore
        result = command.callStop(editor, options);
      }
    }

    return result;
  }

  /**
   * Create anonymous Command instance
   * @param {Object} command Command object
   * @return {Command}
   * @private
   * */
  create(command: CommandObject) {
    if (!command.stop) command.noStop = true;
    const cmd = CommandAbstract.extend(command);
    return new cmd(this.config);
  }

  __onRun(id: string, clb: () => void) {
    const { em, events } = this;
    em.on(`${events.runCommand}${id}`, clb);
  }

  __onStop(id: string, clb: () => void) {
    const { em, events } = this;
    em.on(`${events.stopCommand}${id}`, clb);
  }

  destroy() {
    this.defaultCommands = {};
    this.commands = {};
    this.active = {};
  }
}
