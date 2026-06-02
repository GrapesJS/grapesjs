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
 * editor.on('command:run', () => { ... });
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
 * * [remove](#remove)
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
import CommandAbstract, { Command, CommandConstructor, CommandOptions, CommandStored } from './view/CommandAbstract';
import CanvasClear from './view/CanvasClear';
import CanvasMove from './view/CanvasMove';
import ComponentDelete from './view/ComponentDelete';
import ComponentDrag from './view/ComponentDrag';
import ComponentEnter from './view/ComponentEnter';
import ComponentExit from './view/ComponentExit';
import ComponentNext from './view/ComponentNext';
import ComponentPrev from './view/ComponentPrev';
import ComponentStyleClear from './view/ComponentStyleClear';
import CopyComponent from './view/CopyComponent';
import ExportTemplate from './view/ExportTemplate';
import CommandFullscreen from './view/Fullscreen';
import MoveComponent from './view/MoveComponent';
import OpenAssets from './view/OpenAssets';
import OpenBlocks from './view/OpenBlocks';
import OpenLayers from './view/OpenLayers';
import OpenStyleManager from './view/OpenStyleManager';
import OpenTraitManager from './view/OpenTraitManager';
import PasteComponent from './view/PasteComponent';
import Preview from './view/Preview';
import Resize from './view/Resize';
import SelectComponent from './view/SelectComponent';
import ShowOffset from './view/ShowOffset';
import SwitchVisibility from './view/SwitchVisibility';
import defConfig, { CommandsConfig } from './config/config';
import { Module } from '../abstract';
import Component from '../dom_components/model/Component';
import { ComponentsEvents } from '../dom_components/types';
import type Editor from '../editor/model/Editor';
import type { ObjectAny } from '../common';
import type {
  CommandDefinitionById,
  CommandObjectById,
  CommandRunArgs,
  CommandRunResult,
  CommandStopArgs,
  CommandStopResult,
} from './registry';
import CommandsEvents from './types';
export type { CommandEvent } from './types';

const isCommandConstructor = (command: Command): command is CommandConstructor =>
  isFunction(command) && (command === CommandAbstract || command.prototype instanceof CommandAbstract);

const commandsDef = [
  ['preview', Preview, 'preview'],
  ['resize', Resize, 'resize'],
  ['fullscreen', CommandFullscreen, 'fullscreen'],
  ['copy', CopyComponent],
  ['paste', PasteComponent],
  ['canvas-move', CanvasMove],
  ['canvas-clear', CanvasClear],
  ['open-code', ExportTemplate, 'export-template'],
  ['open-layers', OpenLayers, 'open-layers'],
  ['open-styles', OpenStyleManager, 'open-sm'],
  ['open-traits', OpenTraitManager, 'open-tm'],
  ['open-blocks', OpenBlocks, 'open-blocks'],
  ['open-assets', OpenAssets, 'open-assets'],
  ['component-select', SelectComponent, 'select-comp'],
  ['component-outline', SwitchVisibility, 'sw-visibility'],
  ['component-offset', ShowOffset, 'show-offset'],
  ['component-move', MoveComponent, 'move-comp'],
  ['component-next', ComponentNext],
  ['component-prev', ComponentPrev],
  ['component-enter', ComponentEnter],
  ['component-exit', ComponentExit, 'select-parent'],
  ['component-delete', ComponentDelete],
  ['component-style-clear', ComponentStyleClear],
  ['component-drag', ComponentDrag],
] as const;

const defComOptions = { preserveSelected: 1 };

export const getOnComponentDragStart = (em: Editor) => (data: any) => em.trigger(ComponentsEvents.dragStart, data);

export const getOnComponentDrag = (em: Editor) => (data: any) => em.trigger(ComponentsEvents.drag, data);

export const getOnComponentDragEnd =
  (em: Editor, targets: Component[], opts: { altMode?: boolean } = {}) =>
  (a: any, b: any, data: any) => {
    setTimeout(() => {
      targets.forEach((trg) => trg.set('status', trg.get('selectable') ? 'selected' : ''));
      em.setSelected(targets);
      targets[0].emitUpdate();
    });
    em.trigger(ComponentsEvents.dragEnd, data);

    // Defer selectComponent in order to prevent canvas "freeze" #2692
    setTimeout(() => em.runDefault(defComOptions));

    // Dirty patch to prevent parent selection on drop
    (opts.altMode || data.cancelled) && em.set('_cmpDrag', 1);
  };

export default class CommandsModule extends Module<CommandsConfig & { pStylePrefix?: string }> {
  CommandAbstract = CommandAbstract;
  defaultCommands: Record<string, Command> = {};
  commands: Record<string, CommandStored> = {};
  active: Record<string, any> = {};
  events = CommandsEvents;

  /**
   * @private
   */
  constructor(em: Editor) {
    super(em, 'Commands', defConfig());
    const { config } = this;
    const ppfx = config.pStylePrefix;
    const { defaultCommands } = this;

    if (ppfx) {
      config.stylePrefix = ppfx + config.stylePrefix;
    }

    // Load commands passed via configuration
    Object.keys(config.defaults!).forEach((k) => {
      const obj = config.defaults![k];
      if (obj.id) this.add(obj.id, obj as CommandDefinitionById<typeof obj.id>);
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

        const mode = opts.mode || target.get('dmode') || em.get('dmode');
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
            event?.dataTransfer?.setDragImage(target.view?.el, 0, 0);
            //sel.set('status', 'freezed');
          }

          const cmdMove = ed.Commands.get('move-comp') as any;
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
      const cmd = item[1];
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
  add<const TId extends string, T extends ObjectAny = {}>(id: TId, command: CommandDefinitionById<TId, T>) {
    if (isCommandConstructor(command)) {
      const { prototype } = command;
      const noStop = prototype.stop === CommandAbstract.prototype.stop;

      prototype.noStop = noStop;
      this.commands[id] = command;

      return this;
    }

    let result = (isFunction(command) ? { run: command } : command) as CommandObjectById<string, T>;

    if (!result.stop) {
      result.noStop = true;
    }

    delete result.initialize;

    result.id = id;
    this.commands[id] = CommandAbstract.extend(result) as CommandConstructor;

    return this;
  }

  /**
   * Remove command from the collection
   * @param {string} id Command's ID
   * @return {this}
   */
  remove(id: string) {
    if (this.isActive(id)) {
      this.stopCommand(this.get(id), { force: true });
    }

    delete this.active[id];
    delete this.commands[id];

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
  get(id: string): CommandAbstract | undefined {
    let command = this.commands[id];

    if (isFunction(command)) {
      command = new command(this.config);
      this.commands[id] = command;
    }

    if (command) {
      command.id = id;
    } else {
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
  extend<const TId extends string>(
    id: TId,
    cmd: CommandObjectById<TId, ObjectAny> = {} as CommandObjectById<TId, ObjectAny>,
  ) {
    const command = this.get(id);

    if (command) {
      const cmdObj = {
        ...command.constructor.prototype,
        ...cmd,
      };
      this.add(id, cmdObj);
      // Extend also old name commands if exist
      const oldCmd = commandsDef.filter((cmd) => `core:${cmd[0]}` === id && cmd[2])[0];
      const oldCmdId = oldCmd?.[2];
      oldCmdId && this.add(oldCmdId, cmdObj);
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
  run<const TId extends string>(id: TId, ...args: CommandRunArgs<TId>): CommandRunResult<TId> {
    return this.runCommand(this.get(id), args[0] as CommandOptions) as CommandRunResult<TId>;
  }

  /**
   * Stop the command
   * @param {String} id Command ID
   * @param {Object} [options={}] Options
   * @return {*} The return is defined by the command
   * @example
   * commands.stop('myCommand', { someOption: 1 });
   */
  stop<const TId extends string>(id: TId, ...args: CommandStopArgs<TId>): CommandStopResult<TId> {
    return this.stopCommand(this.get(id), args[0] as CommandOptions) as CommandStopResult<TId>;
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
  runCommand(command?: CommandAbstract, options: CommandOptions = {}) {
    let result;

    if (command?.run) {
      const { em, config } = this;
      const id = command.id as string;
      const editor = em.Editor;

      if (!this.isActive(id) || options.force || !config.strict) {
        const defaultOptionsRunFn = config.defaultOptions?.[id]?.run;
        isFunction(defaultOptionsRunFn) && (options = defaultOptionsRunFn(options));
        result = editor && (command as any).callRun(editor, options);
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
  stopCommand(command?: CommandAbstract, options: CommandOptions = {}) {
    let result;

    if (command?.run) {
      const { em, config } = this;
      const id = command.id as string;
      const editor = em.Editor;

      if (this.isActive(id) || options.force || !config.strict) {
        const defaultOptionsStopFn = config.defaultOptions?.[id]?.stop;
        isFunction(defaultOptionsStopFn) && (options = defaultOptionsStopFn(options));
        result = (command as any).callStop(editor, options);
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
  create(command: CommandObjectById<string, ObjectAny>) {
    if (!command.stop) command.noStop = true;
    const cmd = CommandAbstract.extend(command) as CommandConstructor;
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
