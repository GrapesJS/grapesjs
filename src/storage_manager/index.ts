/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/GrapesJS/grapesjs/blob/master/src/storage_manager/config/config.ts)
 * ```js
 * const editor = grapesjs.init({
 *  storageManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
 *
 * ```js
 * // Listen to events
 * editor.on('storage:start', () => { ... });
 *
 * // Use the API
 * const storageManager = editor.Storage;
 * storageManager.add(...);
 * ```
 *
 * ## Available Events
 * * `storage:start` - Before the storage request is started
 * * `storage:start:store` - Before the store request. The object to store is passed as an argument (which you can edit)
 * * `storage:start:load` - Before the load request. Items to load are passed as an argument (which you can edit)
 * * `storage:load` - Triggered when something was loaded from the storage, loaded object passed as an argument
 * * `storage:store` - Triggered when something is stored to the storage, stored object passed as an argument
 * * `storage:end` - After the storage request is ended
 * * `storage:end:store` - After the store request
 * * `storage:end:load` - After the load request
 * * `storage:error` - On any error on storage request, passes the error as an argument
 * * `storage:error:store` - Error on store request, passes the error as an argument
 * * `storage:error:load` - Error on load request, passes the error as an argument
 *
 * ## Methods
 * * [getConfig](#getconfig)
 * * [isAutosave](#isautosave)
 * * [setAutosave](#setautosave)
 * * [getStepsBeforeSave](#getstepsbeforesave)
 * * [setStepsBeforeSave](#setstepsbeforesave)
 * * [getStorages](#getstorages)
 * * [getCurrent](#getcurrent)
 * * [getCurrentStorage](#getcurrentstorage)
 * * [setCurrent](#setcurrent)
 * * [getStorageOptions](#getstorageoptions)
 * * [add](#add)
 * * [get](#get)
 * * [store](#store)
 * * [load](#load)
 *
 * @module Storage
 */

import { isEmpty, isFunction } from 'underscore';
import { Module } from '../abstract';
import defaults, { StorageManagerConfig } from './config/config';
import LocalStorage from './model/LocalStorage';
import RemoteStorage from './model/RemoteStorage';
import EditorModel from '../editor/model/Editor';
import IStorage, { StorageOptions, ProjectData } from './model/IStorage';

export type * from './model/IStorage';

export type StorageEvent =
  | 'storage:start'
  | 'storage:start:store'
  | 'storage:start:load'
  | 'storage:load'
  | 'storage:store'
  | 'storage:end'
  | 'storage:end:store'
  | 'storage:end:load'
  | 'storage:error'
  | 'storage:error:store'
  | 'storage:error:load';

const eventStart = 'storage:start';
const eventAfter = 'storage:after';
const eventEnd = 'storage:end';
const eventError = 'storage:error';

const STORAGE_LOCAL = 'local';
const STORAGE_REMOTE = 'remote';

export default class StorageManager extends Module<
  StorageManagerConfig & { name?: string; _disable?: boolean; currentStorage?: string }
> {
  storages: Record<string, IStorage> = {};

  constructor(em: EditorModel) {
    super(em, 'StorageManager', defaults);
    const { config } = this;
    if (config._disable) config.type = undefined;
    this.storages = {};
    this.add(STORAGE_LOCAL, new LocalStorage());
    this.add(STORAGE_REMOTE, new RemoteStorage());
    this.setCurrent(config.type!);
  }

  /**
   * Get configuration object
   * @name getConfig
   * @function
   * @return {Object}
   */

  /**
   * Check if autosave is enabled.
   * @returns {Boolean}
   * */
  isAutosave() {
    return !!this.config.autosave;
  }

  /**
   * Set autosave value.
   * @param  {Boolean} value
   * */
  setAutosave(value: boolean) {
    this.config.autosave = !!value;
    return this;
  }

  /**
   * Returns number of steps required before trigger autosave.
   * @returns {Number}
   * */
  getStepsBeforeSave() {
    return this.config.stepsBeforeSave!;
  }

  /**
   * Set steps required before trigger autosave.
   * @param {Number} value
   * */
  setStepsBeforeSave(value: number) {
    this.config.stepsBeforeSave = value;
    return this;
  }

  /**
   * Add new storage.
   * @param {String} type Storage type
   * @param {Object} storage Storage definition
   * @param {Function} storage.load Load method
   * @param  {Function} storage.store Store method
   * @example
   * storageManager.add('local2', {
   *   async load(storageOptions) {
   *     // ...
   *   },
   *   async store(data, storageOptions) {
   *     // ...
   *   },
   * });
   * */
  add<T extends StorageOptions>(type: string, storage: IStorage<T>) {
    this.storages[type] = storage as IStorage;
    return this;
  }

  /**
   * Return storage by type.
   * @param {String} type Storage type
   * @returns {Object|null}
   * */
  get<T extends StorageOptions>(type: string): IStorage<T> | undefined {
    return this.storages[type];
  }

  /**
   * Get all storages.
   * @returns {Object}
   * */
  getStorages() {
    return this.storages;
  }

  /**
   * Get current storage type.
   * @returns {String}
   * */
  getCurrent() {
    return this.config.currentStorage!;
  }

  /**
   * Set current storage type.
   * @param {String} type Storage type
   * */
  setCurrent(type: string) {
    this.getConfig().currentStorage = type;
    return this;
  }

  getCurrentStorage() {
    return this.get(this.getCurrent());
  }

  /**
   * Get storage options by type.
   * @param {String} type Storage type
   * @returns {Object}
   * */
  getStorageOptions(type: string) {
    return this.getCurrentOptions(type);
  }

  /**
   * Store data in the current storage.
   * @param {Object} data Project data.
   * @param {Object} [options] Storage options.
   * @returns {Object} Stored data.
   * @example
   * const data = editor.getProjectData();
   * await storageManager.store(data);
   * */
  async store<T extends StorageOptions>(data: ProjectData, options: T = {} as T) {
    const st = this.getCurrentStorage();
    const opts = { ...this.getCurrentOptions(), ...options };
    const recovery = this.getRecoveryStorage();
    const recoveryOpts = this.getCurrentOptions(STORAGE_LOCAL);

    try {
      await this.__exec(st!, opts, data);
      recovery && (await this.__exec(recovery, recoveryOpts, {}));
    } catch (error) {
      if (recovery) {
        await this.__exec(recovery, recoveryOpts, data);
      } else {
        throw error;
      }
    }

    return data;
  }

  /**
   * Load resource from the current storage by keys
   * @param {Object} [options] Storage options.
   * @returns {Object} Loaded data.
   * @example
   * const data = await storageManager.load();
   * editor.loadProjectData(data);
   * */
  async load<T extends StorageOptions>(options: T = {} as T) {
    const st = this.getCurrentStorage();
    const opts = { ...this.getCurrentOptions(), ...options };
    const recoveryStorage = this.getRecoveryStorage();
    let result: ProjectData | undefined;

    if (recoveryStorage) {
      const recoveryData = await this.__exec(recoveryStorage, this.getCurrentOptions(STORAGE_LOCAL));
      if (!isEmpty(recoveryData)) {
        try {
          await this.__askRecovery();
          result = recoveryData;
        } catch (error) {}
      }
    }

    if (!result) {
      result = await this.__exec(st!, opts);
    }

    return result || {};
  }

  __askRecovery() {
    const { em } = this;
    const recovery = this.getRecovery();

    return new Promise((res, rej) => {
      if (isFunction(recovery)) {
        recovery(res, rej, em?.getEditor());
      } else {
        confirm(em?.t('storageManager.recover')) ? res(null) : rej();
      }
    });
  }

  getRecovery(): StorageManagerConfig['recovery'] {
    return this.config.recovery;
  }

  getRecoveryStorage() {
    const recovery = this.getRecovery();
    return recovery && this.getCurrent() === STORAGE_REMOTE && this.get(STORAGE_LOCAL);
  }

  async __exec(storage: IStorage, opts: StorageOptions, data?: ProjectData) {
    const ev = data ? 'store' : 'load';
    const { onStore, onLoad } = this.getConfig();
    let result;

    this.onStart(ev, data);

    if (!storage) {
      return data || {};
    }

    try {
      const editor = this.em?.getEditor();
      let response: any;

      if (data) {
        let toStore = (onStore && (await onStore(data, editor))) || data;
        toStore = (opts.onStore && (await opts.onStore(toStore, editor))) || toStore;
        response = await storage.store(toStore, opts);
        result = data;
      } else {
        response = await storage.load(opts);
        result = this.__clearKeys(response);
        result = (opts.onLoad && (await opts.onLoad(result, editor))) || result;
        result = (onLoad && (await onLoad(result, editor))) || result;
      }
      this.onAfter(ev, result, response);
      this.onEnd(ev, result);
    } catch (error) {
      this.onError(ev, error);
      throw error;
    }

    return result;
  }

  __clearKeys(data: ProjectData = {}) {
    const config = this.getConfig();
    const reg = new RegExp(`^${config.id}`);
    const result: ProjectData = {};

    for (let itemKey in data) {
      const itemKeyR = itemKey.replace(reg, '');
      result[itemKeyR] = data[itemKey];
    }

    return result;
  }

  getCurrentOptions(type?: string): StorageOptions {
    const config = this.getConfig();
    const current = type || this.getCurrent();
    return config.options![current] || {};
  }

  /**
   * On start callback
   * @private
   */
  onStart(ctx: string, data?: ProjectData) {
    const { em } = this;
    if (em) {
      em.trigger(eventStart);
      ctx && em.trigger(`${eventStart}:${ctx}`, data);
    }
  }

  /**
   * On after callback (before passing data to the callback)
   * @private
   */
  onAfter(ctx: string, data: ProjectData, response: any) {
    const { em } = this;
    if (em) {
      em.trigger(eventAfter);
      em.trigger(`${eventAfter}:${ctx}`, data, response);
      em.trigger(`storage:${ctx}`, data, response);
    }
  }

  /**
   * On end callback
   * @private
   */
  onEnd(ctx: string, data: ProjectData) {
    const { em } = this;
    if (em) {
      em.trigger(eventEnd);
      ctx && em.trigger(`${eventEnd}:${ctx}`, data);
    }
  }

  /**
   * On error callback
   * @private
   */
  onError(ctx: string, data: any) {
    const { em } = this;
    if (em) {
      em.trigger(eventError, data);
      ctx && em.trigger(`${eventError}:${ctx}`, data);
      this.onEnd(ctx, data);
    }
  }

  /**
   * Check if autoload is possible
   * @return {Boolean}
   * @private
   * */
  canAutoload() {
    const storage = this.getCurrentStorage();
    return !!storage && !!this.config.autoload;
  }

  destroy() {
    this.storages = {};
  }
}
