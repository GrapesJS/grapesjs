/**
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var storageManager = editor.StorageManager;
 * ```
 */
module.exports = () => {
  var c = {},
  defaults = require('./config/config'),
  LocalStorage = require('./model/LocalStorage'),
  RemoteStorage = require('./model/RemoteStorage');

  var storages = {};
  var defaultStorages = {};

  return {

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'StorageManager',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @param {string} [config.id='gjs-'] The prefix for the fields, useful to differentiate storing/loading
     * with multiple editors on the same page. For example, in local storage, the item of HTML will be saved like 'gjs-html'
     * @param {Boolean} [config.autosave=true] Indicates if autosave mode is enabled, works in conjunction with stepsBeforeSave
     * @param {number} [config.stepsBeforeSave=1] If autosave enabled, indicates how many steps/changes are necessary
     * before autosave is triggered
     * @param {string} [config.type='local'] Default storage type. Available: 'local' | 'remote' | ''(do not store)
     * @private
     * @example
     * ...
     * {
     *    autosave: false,
     *    type: 'remote',
     * }
     * ...
     */
    init(config) {
      c = config || {};

      for (var name in defaults) {
        if (!(name in c))
          c[name] = defaults[name];
      }

      defaultStorages.remote  = new RemoteStorage(c);
      defaultStorages.local = new LocalStorage(c);
      c.currentStorage = c.type;
      this.loadDefaultProviders().setCurrent(c.type);
      return this;
    },

    /**
     * Checks if autosave is enabled
     * @return {Boolean}
     * */
    isAutosave() {
      return !!c.autosave;
    },

    /**
     * Set autosave value
     * @param  {Boolean}  v
     * @return {this}
     * */
    setAutosave(v) {
      c.autosave = !!v;
      return this;
    },

    /**
     * Returns number of steps required before trigger autosave
     * @return {number}
     * */
    getStepsBeforeSave() {
      return c.stepsBeforeSave;
    },

    /**
     * Set steps required before trigger autosave
     * @param  {number} v
     * @return {this}
     * */
    setStepsBeforeSave(v) {
      c.stepsBeforeSave  = v;
      return this;
    },

    /**
     * Add new storage
     * @param {string} id Storage ID
     * @param  {Object} storage Storage wrapper
     * @param  {Function} storage.load Load method
     * @param  {Function} storage.store Store method
     * @return {this}
     * @example
     * storageManager.add('local2', {
     *   load: function(keys, clb) {
     *     var res = {};
     *     for (var i = 0, len = keys.length; i < len; i++){
     *       var v = localStorage.getItem(keys[i]);
     *       if(v) res[keys[i]] = v;
     *     }
     *     clb(res); // might be called inside some async method
     *   },
     *   store: function(data, clb) {
     *     for(var key in data)
     *       localStorage.setItem(key, data[key]);
     *     clb(); // might be called inside some async method
     *   }
     * });
     * */
    add(id, storage) {
      storages[id] = storage;
      return this;
    },

    /**
     * Returns storage by id
     * @param {string} id Storage ID
     * @return {Object|null}
     * */
    get(id) {
      return storages[id] || null;
    },

    /**
     * Returns all storages
     * @return   {Array}
     * */
    getStorages() {
      return storages;
    },

    /**
     * Returns current storage type
     * @return {string}
     * */
    getCurrent() {
      return c.currentStorage;
    },

    /**
     * Set current storage type
     * @param {string} id Storage ID
     * @return {this}
     * */
    setCurrent(id) {
      c.currentStorage = id;
      return this;
    },

    /**
     * Store key-value resources in the current storage
     * @param  {Object} data Data in key-value format, eg. {item1: value1, item2: value2}
     * @param {Function} clb Callback function
     * @return {Object|null}
     * @example
     * storageManager.store({item1: value1, item2: value2});
     * */
    store(data, clb) {
      var st = this.get(this.getCurrent());
      var dataF = {};

      for(var key in data)
        dataF[c.id + key] = data[key];

      return st ? st.store(dataF, clb) : null;
    },

    /**
     * Load resource from the current storage by keys
     * @param  {string|Array<string>} keys Keys to load
     * @param {Function} clb Callback function
     * @example
     * storageManager.load(['item1', 'item2'], res => {
     *  // res -> {item1: value1, item2: value2}
     * });
     * storageManager.load('item1', res => {
     * // res -> {item1: value1}
     * });
     * */
    load(keys, clb) {
      var st = this.get(this.getCurrent());
      var keysF = [];
      var result = {};

      if(typeof keys === 'string')
        keys = [keys];

      for (var i = 0, len = keys.length; i < len; i++)
        keysF.push(c.id + keys[i]);

      st && st.load(keysF, res => {
        // Restore keys name
        var reg = new RegExp('^' + c.id + '');
        for (var itemKey in res) {
          var itemKeyR = itemKey.replace(reg, '');
          result[itemKeyR] = res[itemKey];
        }

        clb && clb(result);
      });
    },

    /**
     * Load default storages
     * @return {this}
     * @private
     * */
    loadDefaultProviders() {
      for (var id in defaultStorages)
        this.add(id, defaultStorages[id]);
      return this;
    },

    /**
     * Get configuration object
     * @return {Object}
     * @private
     * */
    getConfig() {
      return c;
    },

  };

};
