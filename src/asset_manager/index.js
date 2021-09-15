/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/asset_manager/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  assetManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const assetManager = editor.AssetManager;
 * ```
 * ## Available Events
 * * `asset:add` - Added new asset. The [Asset] is passed as an argument to the callback.
 * * `asset:remove` - Asset removed. The [Asset] is passed as an argument to the callback.
 * * `asset:update` - Asset updated. The updated [Asset] and the object containing changes are passed as arguments to the callback.
 * * `asset:upload:start` - Before the upload is started.
 * * `asset:upload:end` - After the upload is ended.
 * * `asset:upload:error` - On any error in upload, passes the error as an argument.
 * * `asset:upload:response` - On upload response, passes the result as an argument.
 * * `asset` - Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
 *
 * ## Methods
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [getAllVisible](#getallvisible)
 * * [remove](#remove)
 * * [store](#store)
 * * [load](#load)
 * * [getContainer](#getcontainer)
 * * [getAssetsEl](#getassetsel)
 * * [addType](#addtype)
 * * [getType](#gettype)
 * * [getTypes](#gettypes)
 *
 * [Asset]: asset.html
 *
 * @module AssetManager
 */

import Module from 'common/module';
import defaults from './config/config';
import Asset from './model/Assets';
import Assets from './model/Assets';
import AssetsView from './view/AssetsView';
import FileUpload from './view/FileUploader';

export const evAll = 'asset';
export const evPfx = `${evAll}:`;
export const evSelect = `${evPfx}select`;
export const evUpdate = `${evPfx}update`;
export const evAdd = `${evPfx}add`;
export const evRemove = `${evPfx}remove`;
export const evRemoveBefore = `${evRemove}:before`;

export default () => {
  let c = {};
  let assets, assetsVis, am, fu;

  return {
    ...Module,

    name: 'AssetManager',

    storageKey: 'assets',

    Asset,

    Assets,

    events: {
      all: evAll,
      select: evSelect,
      update: evUpdate,
      add: evAdd,
      remove: evRemove,
      removeBefore: evRemoveBefore
    },

    init(config = {}) {
      c = { ...defaults, ...config };
      const ppfx = c.pStylePrefix;
      const { em } = c;
      this.config = c;
      this.em = em;

      if (ppfx) {
        c.stylePrefix = ppfx + c.stylePrefix;
      }

      // Global assets collection
      assets = new Assets([]);
      assetsVis = new Assets([]);
      this.all = assets;
      this.__initListen();

      // Setup the sync between the global and public collections
      assets.on('add', model => this.getAllVisible().add(model));
      assets.on('remove', model => this.getAllVisible().remove(model));

      return this;
    },

    __propEv(ev, ...data) {
      this.em.trigger(ev, ...data);
      this.getAll().trigger(ev, ...data);
    },

    /**
     * Open the asset manager.
     * @param {Object} [options] Options for the asset manager.
     * @param {Array<String>} [options.types=['image']] Types of assets to show.
     * @example
     * assetManager.open();
     * // with your custom types (you should have assets with those types declared)
     * assetManager.open({ types: ['doc'] });
     */
    open(options = {}) {
      const cmd = this.em.get('Commands');
      cmd.run('open-assets', options);
    },

    /**
     * Close the asset manager.
     * @example
     * assetManager.close();
     */
    close() {
      const cmd = this.em.get('Commands');
      cmd.stop('open-assets');
    },

    /**
     * Add new asset/s to the collection. URLs are supposed to be unique
     * @param {String|Object|Array<String>|Array<Object>} asset URL strings or an objects representing the resource.
     * @param {Object} [opts] Options
     * @returns {[Asset]}
     * @example
     * // As strings
     * assetManager.add('http://img.jpg');
     * assetManager.add(['http://img.jpg', './path/to/img.png']);
     *
     * // Using objects you can indicate the type and other meta informations
     * assetManager.add({
     *  // type: 'image',	// image is default
     * 	src: 'http://img.jpg',
     * 	height: 300,
     *	width: 200,
     * });
     * assetManager.add([{ src: 'img2.jpg' }, { src: 'img2.png' }]);
     */
    add(asset, opts = {}) {
      // Put the model at the beginning
      if (typeof opts.at == 'undefined') {
        opts.at = 0;
      }

      return assets.add(asset, opts);
    },

    /**
     * Return asset by URL
     * @param  {String} src URL of the asset
     * @returns {[Asset]|null} Object representing the asset
     * @example
     * const asset = assetManager.get('http://img.jpg');
     */
    get(src) {
      return assets.where({ src })[0] || null;
    },

    /**
     * Return the global collection, containing all the assets
     * @returns {Collection<[Asset]>}
     */
    getAll() {
      return assets;
    },

    /**
     * Return the visible collection, which contains assets actually rendered
     * @returns {Collection<[Asset]>}
     */
    getAllVisible() {
      return assetsVis;
    },

    /**
     * Remove asset
     * @param {String|[Asset]} asset Asset or asset URL
     * @returns {[Asset]} Removed asset
     * @example
     * const removed = assetManager.remove('http://img.jpg');
     * // or by passing the Asset
     * const asset = assetManager.get('http://img.jpg');
     * assetManager.remove(asset);
     */
    remove(asset, opts) {
      return this.__remove(asset, opts);
    },

    /**
     * Store assets data to the selected storage
     * @param {Boolean} noStore If true, won't store
     * @returns {Object} Data to store
     * @example
     * var assets = assetManager.store();
     */
    store(noStore) {
      const obj = {};
      const assets = JSON.stringify(this.getAll().toJSON());
      obj[this.storageKey] = assets;
      if (!noStore && c.stm) c.stm.store(obj);
      return obj;
    },

    /**
     * Load data from the passed object.
     * The fetched data will be added to the collection.
     * @param {Object} data Object of data to load
     * @returns {Object} Loaded assets
     * @example
     * var assets = assetManager.load({
     * 	assets: [...]
     * })
     *
     */
    load(data = {}) {
      const name = this.storageKey;
      let assets = data[name] || [];

      if (typeof assets == 'string') {
        try {
          assets = JSON.parse(data[name]);
        } catch (err) {}
      }

      if (assets && assets.length) {
        this.getAll().reset(assets);
      }

      return assets;
    },

    /**
     * Return the Asset Manager Container
     * @returns {HTMLElement}
     */
    getContainer() {
      return am.el;
    },

    /**
     *  Get assets element container
     * @returns {HTMLElement}
     */
    getAssetsEl() {
      return am.el.querySelector('[data-el=assets]');
    },

    /**
     * Render assets
     * @param  {array} assets Assets to render, without the argument will render all global assets
     * @returns {HTMLElement}
     * @example
     * // Render all assets
     * assetManager.render();
     *
     * // Render some of the assets
     * const assets = assetManager.getAll();
     * assetManager.render(assets.filter(
     *  asset => asset.get('category') == 'cats'
     * ));
     */
    render(assts) {
      if (this.getConfig('custom')) return;
      const toRender = assts || this.getAll().models;

      if (!am) {
        const obj = {
          collection: assetsVis, // Collection visible in asset manager
          globalCollection: assets,
          config: c,
          module: this
        };
        fu = new FileUpload(obj);
        obj.fu = fu;
        const el = am && am.el;
        am = new AssetsView({
          el,
          ...obj
        });
        am.render();
      }

      assetsVis.reset(toRender);
      return this.getContainer();
    },

    /**
     * Add new type. If you want to get more about type definition we suggest to read the [module's page](/modules/Assets.html)
     * @param {string} id Type ID
     * @param {Object} definition Definition of the type. Each definition contains
     *                            `model` (business logic), `view` (presentation logic)
     *                            and `isType` function which recognize the type of the
     *                            passed entity
     * @example
     * assetManager.addType('my-type', {
     *  model: {},
     *  view: {},
     *  isType: (value) => {},
     * })
     */
    addType(id, definition) {
      this.getAll().addType(id, definition);
    },

    /**
     * Get type
     * @param {string} id Type ID
     * @returns {Object} Type definition
     */
    getType(id) {
      return this.getAll().getType(id);
    },

    /**
     * Get types
     * @returns {Array}
     */
    getTypes() {
      return this.getAll().getTypes();
    },

    //-------

    AssetsView() {
      return am;
    },

    FileUploader() {
      return fu;
    },

    onLoad() {
      this.getAll().reset(c.assets);
    },

    postRender(editorView) {
      c.dropzone && fu && fu.initDropzone(editorView);
    },

    /**
     * Set new target
     * @param	{Object}	m Model
     * @private
     * */
    setTarget(m) {
      assetsVis.target = m;
    },

    /**
     * Set callback after asset was selected
     * @param	{Object}	f Callback function
     * @private
     * */
    onSelect(f) {
      assetsVis.onSelect = f;
    },

    /**
     * Set callback to fire when the asset is clicked
     * @param {function} func
     * @private
     */
    onClick(func) {
      c.onClick = func;
    },

    /**
     * Set callback to fire when the asset is double clicked
     * @param {function} func
     * @private
     */
    onDblClick(func) {
      c.onDblClick = func;
    },

    destroy() {
      assets.stopListening();
      assetsVis.stopListening();
      assets.reset();
      assetsVis.reset();
      fu && fu.remove();
      am && am.remove();
      [assets, am, fu].forEach(i => (i = null));
      c = {};
    }
  };
};
