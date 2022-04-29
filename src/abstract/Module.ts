import { isElement } from 'underscore';
import EditorModel from "../editor/model/Editor";

export interface IModule<TConfig extends any = any> extends IBaseModule<TConfig> {
  init(cfg: any): void;
  destroy(): void;
  postLoad(key: any): any;
  getConfig(): ModuleConfig;
  onLoad?(): void;
  name: string;
  postRender?(view: any): void;
}

export interface IBaseModule<TConfig extends any> {
  em: EditorModel;
  config: TConfig;
}

export interface ModuleConfig {
  name?: string;
  stylePrefix?: string;
  appendTo?: string;
}

export default abstract class Module<T extends ModuleConfig = ModuleConfig>
  implements IModule<T>
{
  //conf: CollectionCollectionModuleConfig;
  private _em: EditorModel;
  private _config: T;
  cls: any[] = [];
  events: any;
  model?: any;
  view?: any;

  constructor(
    em: EditorModel,
    config: T
  ) {
    this._em = em;
    this._config = config;
  }

  // Temporary alternative to constructor
  __init(em: EditorModel, config: T) {
    this._em = em;
    this._config = config;
    this.init(config);
  }
  __initDefaults(defaults: T) {
    this._config = { ...defaults, ...this._config };
  }

  public get em() {
    return this._em;
  }
  public get config() {
    return this._config;
  }
  //abstract name: string;
  isPrivate: boolean = false;
  onLoad?(): void;
  init(cfg: T) {}
  abstract destroy(): void;
  abstract render(): HTMLElement;
  postLoad(key: any): void {}

  get name(): string {
    return this.config.name || '';
  }

  getConfig() {
    return this.config;
  }

  __logWarn(str: string) {
    this.em.logWarning(`[${this.name}]: ${str}`);
  }

  postRender?(view: any): void;

  /**
   * Move the main DOM element of the module.
   * To execute only post editor render (in postRender)
   */
   __appendTo() {
    const elTo = this.getConfig().appendTo;

    if (elTo) {
      const el = isElement(elTo) ? elTo : document.querySelector(elTo);
      if (!el) return this.__logWarn('"appendTo" element not found');
      el.appendChild(this.render());
    }
  }
}
