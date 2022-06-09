/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/storage_manager/config/config.js)
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
 * * `storage:start:store` - Before the store request. The object to store is passed as an argumnet (which you can edit)
 * * `storage:start:load` - Before the load request. Items to load are passed as an argumnet (which you can edit)
 * * `storage:load` - Triggered when something was loaded from the storage, loaded object passed as an argumnet
 * * `storage:store` - Triggered when something is stored to the storage, stored object passed as an argumnet
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

import Module from '../abstract/moduleLegacy';
import defaults from './config/config';
import LocalStorage from './model/LocalStorage';
import RemoteStorage from './model/RemoteStorage';
import { isEmpty, isFunction } from 'underscore';

const eventStart = 'storage:start';
const eventAfter = 'storage:after';
const eventEnd = 'storage:end';
const eventError = 'storage:error';

const STORAGE_LOCAL = 'local';
const STORAGE_REMOTE = 'remote';

export default class StorageManager extends Module {
  name = 'StorageManager';

  /**
   * Get configuration object
   * @name getConfig
   * @function
   * @return {Object}
   */

  /**
   * Initialize module. Automatically called with a new instance of the editor
   * @param {Object} config Configurations
   * @private
   */
  init(config = {}) {
    this.__initConfig(defaults, config);
    const c = this.getConfig();
    if (c._disable) c.type = 0;
    this.storages = {};
    this.add(STORAGE_LOCAL, new LocalStorage(c));
    this.add(STORAGE_REMOTE, new RemoteStorage(c));
    this.setCurrent(c.type);
    return this;
  }

  /**
   * Check if autosave is enabled.
   * @returns {Boolean}
   * */
  isAutosave() {
    return !!this.getConfig().autosave;
  }

  /**
   * Set autosave value.
   * @param  {Boolean} value
   * */
  setAutosave(value) {
    this.getConfig().autosave = !!value;
    return this;
  }

  /**
   * Returns number of steps required before trigger autosave.
   * @returns {Number}
   * */
  getStepsBeforeSave() {
    return this.getConfig().stepsBeforeSave;
  }

  /**
   * Set steps required before trigger autosave.
   * @param {Number} value
   * */
  setStepsBeforeSave(value) {
    this.getConfig().stepsBeforeSave = value;
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
  add(type, storage) {
    this.storages[type] = storage;
    return this;
  }

  /**
   * Return storage by type.
   * @param {String} type Storage type
   * @returns {Object|null}
   * */
  get(type) {
    return this.storages[type] || null;
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
    return this.getConfig().currentStorage;
  }

  /**
   * Set current storage type.
   * @param {String} type Storage type
   * */
  setCurrent(type) {
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
  getStorageOptions(type) {
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
  async store(data, options = {}) {
    const st = this.getCurrentStorage();
    const opts = { ...this.getCurrentOptions(), ...options };
    const recovery = this.getRecoveryStorage();
    const recoveryOpts = this.getCurrentOptions(STORAGE_LOCAL);

    try {
      await this.__exec(st, opts, data);
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
  async load(options = {}) {
    const st = this.getCurrentStorage();
    const opts = { ...this.getCurrentOptions(), ...options };
    const recoveryStorage = this.getRecoveryStorage();
    let result;

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
      result = await this.__exec(st, opts);
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
        confirm(em?.t('storageManager.recover')) ? res() : rej();
      }
    });
  }

  getRecovery() {
    return this.getConfig().recovery;
  }

  getRecoveryStorage() {
    const recovery = this.getRecovery();
    return recovery && this.getCurrent() === STORAGE_REMOTE && this.get(STORAGE_LOCAL);
  }

  async __exec(storage, opts, data) {
    const ev = data ? 'store' : 'load';
    const { onStore, onLoad } = this.getConfig();
    let result;

    this.onStart(ev, data);

    if (!storage) {
      return data || {};
    }

    try {
      const editor = this.em?.getEditor();

      if (data) {
        let toStore = (onStore && (await onStore(data, editor))) || data;
        toStore = (opts.onStore && (await opts.onStore(toStore, editor))) || toStore;
        await storage.store(toStore, opts);
        result = data;
      } else {
        result = await storage.load(opts);
        result = this.__clearKeys(result);
        result = (opts.onLoad && (await opts.onLoad(result, editor))) || result;
        result = (onLoad && (await onLoad(result, editor))) || result;
      }
      this.onAfter(ev, result);
      this.onEnd(ev, result);
    } catch (error) {
      this.onError(ev, error);
      throw error;
    }

    return result;
  }

  __clearKeys(data = {}) {
    const config = this.getConfig();
    const reg = new RegExp(`^${config.id}`);
    const result = {};

    for (let itemKey in data) {
      const itemKeyR = itemKey.replace(reg, '');
      result[itemKeyR] = data[itemKey];
    }

    return result;
  }

  getCurrentOptions(type) {
    const config = this.getConfig();
    const current = type || this.getCurrent();
    return config.options[current] || {};
  }

  /**
   * On start callback
   * @private
   */
  onStart(ctx, data) {
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
  onAfter(ctx, data) {
    const { em } = this;
    if (em) {
      em.trigger(eventAfter);
      em.trigger(`${eventAfter}:${ctx}`, data);
      em.trigger(`storage:${ctx}`, data);
    }
  }

  /**
   * On end callback
   * @private
   */
  onEnd(ctx, data) {
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
  onError(ctx, data) {
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
    return storage && this.getConfig().autoload;
  }

  destroy() {
    this.__destroy();
    this.storages = {};
  }
}
