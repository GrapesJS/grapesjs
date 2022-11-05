import { isElement, isUndefined, isString } from 'underscore';
import { Collection, View } from '../common';
import { EditorConfigKeys } from '../editor/config/config';
import EditorModel from '../editor/model/Editor';
import { createId, isDef, deepMerge } from '../utils/mixins';

export interface IModule<TConfig extends any = any> extends IBaseModule<TConfig> {
  init(cfg: any): void;
  destroy(): void;
  postLoad(key: any): any;
  config: TConfig;
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
  appendTo?: string | HTMLElement;
}

export interface IStorableModule extends IModule {
  storageKey: string[] | string;
  store(result: any): any;
  load(keys: string[]): void;
  postLoad(key: any): any;
}

export default abstract class Module<T extends ModuleConfig = ModuleConfig> implements IModule<T> {
  private _em: EditorModel;
  private _config: T;
  private _name: string;
  cls: any[] = [];
  events: any;
  model?: any;
  view?: any;

  constructor(em: EditorModel, moduleName: string, defaults?: T) {
    this._em = em;
    this._name = moduleName;
    const name = (this.name.charAt(0).toLowerCase() + this.name.slice(1)) as EditorConfigKeys;
    const cfgParent = !isUndefined(em.config[name]) ? em.config[name] : em.config[this.name as EditorConfigKeys];
    const cfg = (cfgParent === true ? {} : cfgParent || {}) as Record<string, any>;
    cfg.pStylePrefix = em.config.pStylePrefix || '';

    if (!isUndefined(cfgParent) && !cfgParent) {
      cfg._disable = 1;
    }

    cfg.em = em;
    this._config = deepMerge(defaults || {}, cfg) as T;
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
  render(): HTMLElement | JQuery<HTMLElement> | void {}
  postLoad(key: any): void {}

  get name(): string {
    return this._name;
  }

  getConfig(name?: string) {
    // @ts-ignore
    return name ? this.config[name] : this.config;
  }

  __logWarn(str: string, opts = {}) {
    this.em.logWarning(`[${this.name}]: ${str}`, opts);
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

export abstract class ItemManagerModule<
  TConf extends ModuleConfig = any,
  TCollection extends Collection = Collection
> extends Module<TConf> {
  cls: any[] = [];
  protected all: TCollection;
  view?: View;

  constructor(em: EditorModel, moduleName: string, all: any, events?: any, defaults?: TConf) {
    super(em, moduleName, defaults);
    this.all = all;
    this.events = events;
    this.__initListen();
  }

  private: boolean = false;

  abstract storageKey: string;
  abstract destroy(): void;
  postLoad(key: any): void {}
  // @ts-ignore
  render() {}

  getProjectData(data?: any) {
    const obj: any = {};
    const key = this.storageKey;
    if (key) {
      obj[key] = data || this.getAll();
    }
    return obj;
  }

  loadProjectData(data: any = {}, param: { all?: TCollection; onResult?: Function; reset?: boolean } = {}) {
    const { all, onResult, reset } = param;
    const key = this.storageKey;
    const opts: any = { action: 'load' };
    const coll = all || this.all;
    let result = data[key];

    if (typeof result == 'string') {
      try {
        result = JSON.parse(result);
      } catch (err) {
        this.__logWarn('Data parsing failed', { input: result });
      }
    }

    reset && result && coll.reset(undefined, opts);

    if (onResult) {
      result && onResult(result, opts);
    } else if (result && isDef(result.length)) {
      coll.reset(result, opts);
    }

    return result;
  }

  clear(opts = {}) {
    const { all } = this;
    all && all.reset(undefined, opts);
    return this;
  }

  getAll(): TCollection extends Collection<infer C> ? C[] : unknown[] {
    return [...this.all.models] as any;
  }

  getAllMap(): {
    [key: string]: TCollection extends Collection<infer C> ? C : unknown;
  } {
    return this.getAll().reduce((acc, i) => {
      acc[i.get(i.idAttribute)] = i;
      return acc;
    }, {} as any);
  }

  __initListen(opts: any = {}) {
    const { all, em, events } = this;
    all &&
      em &&
      all
        .on('add', (m: any, c: any, o: any) => em.trigger(events.add, m, o))
        .on('remove', (m: any, c: any, o: any) => em.trigger(events.remove, m, o))
        .on('change', (p: any, c: any) => em.trigger(events.update, p, p.changedAttributes(), c))
        .on('all', this.__catchAllEvent, this);
    // Register collections
    this.cls = [all].concat(opts.collections || []);
    // Propagate events
    ((opts.propagate as any[]) || []).forEach(({ entity, event }) => {
      entity.on('all', (ev: any, model: any, coll: any, opts: any) => {
        const options = opts || coll;
        const opt = { event: ev, ...options };
        [em, all].map(md => md.trigger(event, model, opt));
      });
    });
  }

  __remove(model: any, opts: any = {}) {
    const { em } = this;
    //@ts-ignore
    const md = isString(model) ? this.get(model) : model;
    const rm = () => {
      md && this.all.remove(md, opts);
      return md;
    };
    !opts.silent && em?.trigger(this.events.removeBefore, md, rm, opts);
    return !opts.abort && rm();
  }

  __catchAllEvent(event: any, model: any, coll: any, opts?: any) {
    const { em, events } = this;
    const options = opts || coll;
    em && events.all && em.trigger(events.all, { event, model, options });
    this.__onAllEvent();
  }

  __appendTo(renderProps?: any) {
    //@ts-ignore
    const elTo = this.config.appendTo;

    if (elTo) {
      const el = isElement(elTo) ? elTo : document.querySelector(elTo);
      if (!el) return this.__logWarn('"appendTo" element not found');
      // @ts-ignore
      el.appendChild(this.render(renderProps));
    }
  }

  __onAllEvent() {}

  _createId(len = 16) {
    const all = this.getAll();
    const ln = all.length + len;
    const allMap = this.getAllMap();
    let id;

    do {
      id = createId(ln);
    } while (allMap[id]);

    return id;
  }

  __listenAdd(model: TCollection, event: string) {
    model.on('add', (m, c, o) => this.em.trigger(event, m, o));
  }

  __listenRemove(model: TCollection, event: string) {
    model.on('remove', (m, c, o) => this.em.trigger(event, m, o));
  }

  __listenUpdate(model: TCollection, event: string) {
    model.on('change', (p, c) => this.em.trigger(event, p, p.changedAttributes(), c));
  }

  __destroy() {
    this.cls.forEach(coll => {
      coll.stopListening();
      coll.reset();
    });
    this.view?.remove();
    this.view = undefined;
  }
}
