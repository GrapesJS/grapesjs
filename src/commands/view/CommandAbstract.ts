import CanvasModule from '../../canvas';
import { Model, ObjectAny } from '../../common';
import Editor from '../../editor';
import EditorModel from '../../editor/model/Editor';

interface ICommand<O extends ObjectAny = any> {
  run?: CommandAbstract<O>['run'];
  stop?: CommandAbstract<O>['stop'];
  id?: string;
  [key: string]: unknown;
}

export type CommandFunction<O extends ObjectAny = any> = CommandAbstract<O>['run'];

export type Command = CommandObject | CommandFunction;

export type CommandOptions = Record<string, any>;

export type CommandObject<O extends ObjectAny = any, T extends ObjectAny = {}> = ICommand<O> &
  T &
  ThisType<T & CommandAbstract<O>>;

export function defineCommand<O extends ObjectAny = any, T extends ObjectAny = {}>(def: CommandObject<O, T>) {
  return def;
}

export default class CommandAbstract<O extends ObjectAny = any> extends Model {
  config: any;
  em: EditorModel;
  pfx: string;
  ppfx: string;
  hoverClass: string;
  badgeClass: string;
  plhClass: string;
  freezClass: string;
  canvas: CanvasModule;

  constructor(o: any) {
    super(0);
    this.config = o || {};
    this.em = this.config.em || {};
    const pfx = this.config.stylePrefix;
    this.pfx = pfx;
    this.ppfx = this.config.pStylePrefix;
    this.hoverClass = `${pfx}hover`;
    this.badgeClass = `${pfx}badge`;
    this.plhClass = `${pfx}placeholder`;
    this.freezClass = `${this.ppfx}freezed`;
    this.canvas = this.em.Canvas;
    this.init(this.config);
  }

  /**
   * On frame scroll callback
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  onFrameScroll(e: any) {}

  /**
   * Returns canval element
   * @return {HTMLElement}
   */
  getCanvas() {
    return this.canvas.getElement();
  }

  /**
   * Get canvas body element
   * @return {HTMLElement}
   */
  getCanvasBody() {
    return this.canvas.getBody();
  }

  /**
   * Get canvas wrapper element
   * @return {HTMLElement}
   */
  getCanvasTools() {
    return this.canvas.getToolsEl();
  }

  /**
   * Get the offset of the element
   * @param  {HTMLElement} el
   * @return {Object}
   */
  offset(el: HTMLElement) {
    var rect = el.getBoundingClientRect();
    return {
      top: rect.top + el.ownerDocument.body.scrollTop,
      left: rect.left + el.ownerDocument.body.scrollLeft,
    };
  }

  /**
   * Callback triggered after initialize
   * @param  {Object}  o   Options
   * @private
   * */
  init(o: any) {}

  /**
   * Method that run command
   * @param  {Object}  editor Editor instance
   * @param  {Object}  [options={}] Options
   * @private
   * */
  callRun(editor: Editor, options: any = {}) {
    const id = this.id;
    editor.trigger(`run:${id}:before`, options);

    if (options && options.abort) {
      editor.trigger(`abort:${id}`, options);
      return;
    }

    const sender = options.sender || editor;
    const result = this.run(editor, sender, options);
    editor.trigger(`run:${id}`, result, options);
    editor.trigger('run', id, result, options);
    return result;
  }

  /**
   * Method that run command
   * @param  {Object}  editor Editor instance
   * @param  {Object}  [options={}] Options
   * @private
   * */
  callStop(editor: Editor, options: any = {}) {
    const id = this.id;
    const sender = options.sender || editor;
    editor.trigger(`stop:${id}:before`, options);
    const result = this.stop(editor, sender, options);
    editor.trigger(`stop:${id}`, result, options);
    editor.trigger('stop', id, result, options);
    return result;
  }

  /**
   * Stop current command
   */
  stopCommand(opts?: any) {
    this.em.Commands.stop(this.id as string, opts);
  }

  /**
   * Method that run command
   * @param  {Object}  em     Editor model
   * @param  {Object}  sender  Button sender
   * @private
   * */
  run(em: Editor, sender: any, options: O) {}

  /**
   * Method that stop command
   * @param  {Object}  em Editor model
   * @param  {Object}  sender  Button sender
   * @private
   * */
  stop(em: Editor, sender: any, options: O) {}
}
