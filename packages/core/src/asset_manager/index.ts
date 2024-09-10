/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/GrapesJS/grapesjs/blob/master/src/asset_manager/config/config.ts)
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
 *
 * {REPLACE_EVENTS}
 *
 * ## Methods
 * * [open](#open)
 * * [close](#close)
 * * [isOpen](#isopen)
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [getAllVisible](#getallvisible)
 * * [remove](#remove)
 * * [getContainer](#getcontainer)
 *
 * [Asset]: asset.html
 *
 * @module Assets
 */

import { debounce, isFunction } from 'underscore';
import { ItemManagerModule } from '../abstract/Module';
import { AddOptions, RemoveOptions } from '../common';
import EditorModel from '../editor/model/Editor';
import { ProjectData } from '../storage_manager';
import defaults, { AssetManagerConfig } from './config/config';
import Asset from './model/Asset';
import Assets from './model/Assets';
import AssetsEvents, { AssetOpenOptions } from './types';
import AssetsView from './view/AssetsView';
import FileUploaderView from './view/FileUploader';

// TODO
type AssetProps = Record<string, any>;

const assetCmd = 'open-assets';

export default class AssetManager extends ItemManagerModule<AssetManagerConfig, Assets> {
  storageKey = 'assets';
  Asset = Asset;
  Assets = Assets;
  assetsVis: Assets;
  am?: AssetsView;
  fu?: FileUploaderView;
  _bhv?: any;
  events = AssetsEvents;

  /**
   * Initialize module
   * @param {Object} config Configurations
   * @private
   */
  constructor(em: EditorModel) {
    // @ts-ignore
    super(em, 'AssetManager', new Assets([], em), AssetsEvents, defaults);
    const { all, config } = this;
    // @ts-ignore
    this.assetsVis = new Assets([]);
    const ppfx = config.pStylePrefix;
    if (ppfx) {
      config.stylePrefix = `${ppfx}${config.stylePrefix}`;
    }

    // Setup the sync between the global and public collections
    all.on('add', (model: Asset) => this.getAllVisible().add(model));
    all.on('remove', (model: Asset) => this.getAllVisible().remove(model));

    this.__onAllEvent = debounce(() => this.__trgCustom(), 0);

    return this;
  }

  /**
   * Open the asset manager.
   * @param {Object} [options] Options for the asset manager.
   * @param {Array<String>} [options.types=['image']] Types of assets to show.
   * @param {Function} [options.select] Type of operation to perform on asset selection. If not specified, nothing will happen.
   * @example
   * assetManager.open({
   *  select(asset, complete) {
   *    const selected = editor.getSelected();
   *    if (selected && selected.is('image')) {
   *      selected.addAttributes({ src: asset.getSrc() });
   *      // The default AssetManager UI will trigger `select(asset, false)` on asset click
   *      // and `select(asset, true)` on double-click
   *      complete && assetManager.close();
   *    }
   *  }
   * });
   * // with your custom types (you should have assets with those types declared)
   * assetManager.open({ types: ['doc'], ... });
   */
  open(options: AssetOpenOptions = {}) {
    const cmd = this.em.Commands;
    cmd.run(assetCmd, {
      types: ['image'],
      select: () => {},
      ...options,
    });
  }

  /**
   * Close the asset manager.
   * @example
   * assetManager.close();
   */
  close() {
    const cmd = this.em.Commands;
    cmd.stop(assetCmd);
  }

  /**
   * Checks if the asset manager is open
   * @returns {Boolean}
   * @example
   * assetManager.isOpen(); // true | false
   */
  isOpen() {
    const cmd = this.em.Commands;
    return !!cmd?.isActive(assetCmd);
  }

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
  add(asset: string | AssetProps | (string | AssetProps)[], opts: AddOptions = {}) {
    // Put the model at the beginning
    if (typeof opts.at == 'undefined') {
      opts.at = 0;
    }

    return this.all.add(asset, opts);
  }

  /**
   * Return asset by URL
   * @param  {String} src URL of the asset
   * @returns {[Asset]|null}
   * @example
   * const asset = assetManager.get('http://img.jpg');
   */
  get(src: string): Asset | null {
    return this.all.where({ src })[0] || null;
  }

  /**
   * Return the global collection, containing all the assets
   * @returns {Collection<[Asset]>}
   */
  getAll() {
    return this.all;
  }

  /**
   * Return the visible collection, which contains assets actually rendered
   * @returns {Collection<[Asset]>}
   */
  getAllVisible() {
    return this.assetsVis;
  }

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
  remove(asset: string | Asset, opts?: RemoveOptions) {
    return this.__remove(asset, opts);
  }

  store() {
    return this.getProjectData();
  }

  load(data: ProjectData) {
    return this.loadProjectData(data);
  }

  /**
   * Return the Asset Manager Container
   * @returns {HTMLElement}
   */
  getContainer() {
    const bhv = this.__getBehaviour();
    return bhv.container || this.am?.el;
  }

  /**
   *  Get assets element container
   * @returns {HTMLElement}
   * @private
   */
  getAssetsEl() {
    return this.am?.el.querySelector('[data-el=assets]');
  }

  /**
   * Render assets
   * @param  {array} assets Assets to render, without the argument will render all global assets
   * @returns {HTMLElement}
   * @private
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
  render(assts?: Asset[]) {
    if (this.getConfig().custom) return;
    const toRender = assts || this.getAll().models;

    if (!this.am) {
      const obj = this.__viewParams();
      obj.fu = this.FileUploader();
      this.am = new AssetsView({ ...obj });
      this.am.render();
    }

    this.assetsVis.reset(toRender);
    return this.getContainer();
  }

  __viewParams() {
    return {
      collection: this.assetsVis, // Collection visible in asset manager
      globalCollection: this.all,
      config: this.config,
      module: this as AssetManager,
      fu: undefined as any,
    };
  }

  /**
   * Add new type. If you want to get more about type definition we suggest to read the [module's page](/modules/Assets.html)
   * @param {string} id Type ID
   * @param {Object} definition Definition of the type. Each definition contains
   *                            `model` (business logic), `view` (presentation logic)
   *                            and `isType` function which recognize the type of the
   *                            passed entity
   * @private
   * @example
   * assetManager.addType('my-type', {
   *  model: {},
   *  view: {},
   *  isType: (value) => {},
   * })
   */
  addType(id: string, definition: any) {
    this.getAll().addType(id, definition);
  }

  /**
   * Get type
   * @param {string} id Type ID
   * @returns {Object} Type definition
   * @private
   */
  getType(id: string) {
    return this.getAll().getType(id);
  }

  /**
   * Get types
   * @returns {Array}
   * @private
   */
  getTypes() {
    return this.getAll().getTypes();
  }

  //-------

  AssetsView() {
    return this.am;
  }

  FileUploader() {
    if (!this.fu) {
      this.fu = new FileUploaderView(this.__viewParams());
    }
    return this.fu;
  }

  onLoad() {
    this.getAll().reset(this.config.assets);
    const { em, events } = this;
    em.Commands.__onRun(assetCmd, () => this.__propEv(events.open));
    em.Commands.__onStop(assetCmd, () => this.__propEv(events.close));
  }

  postRender(editorView: any) {
    this.config.dropzone && this.fu?.initDropzone(editorView);
  }

  /**
   * Set new target
   * @param	{Object}	m Model
   * @private
   * */
  setTarget(m: any) {
    this.assetsVis.target = m;
  }

  /**
   * Set callback after asset was selected
   * @param	{Object}	f Callback function
   * @private
   * */
  onSelect(f: any) {
    this.assetsVis.onSelect = f;
  }

  /**
   * Set callback to fire when the asset is clicked
   * @param {function} func
   * @private
   */
  onClick(func: any) {
    // @ts-ignore
    this.config.onClick = func;
  }

  /**
   * Set callback to fire when the asset is double clicked
   * @param {function} func
   * @private
   */
  onDblClick(func: any) {
    // @ts-ignore
    this.config.onDblClick = func;
  }

  __propEv(ev: string, ...data: any[]) {
    this.em.trigger(ev, ...data);
    this.getAll().trigger(ev, ...data);
  }

  __trgCustom() {
    const bhv = this.__getBehaviour();
    const custom = this.getConfig().custom;

    if (!bhv.container && !(custom as any).open) {
      return;
    }
    this.em.trigger(this.events.custom, this.__customData());
  }

  __customData() {
    const bhv = this.__getBehaviour();
    return {
      am: this as AssetManager,
      open: this.isOpen(),
      assets: this.getAll().models,
      types: bhv.types || [],
      container: bhv.container,
      close: () => this.close(),
      remove: (asset: string | Asset, opts?: Record<string, any>) => this.remove(asset, opts),
      select: (asset: Asset, complete: boolean) => {
        const res = this.add(asset);
        isFunction(bhv.select) && bhv.select(res, complete);
      },
      // extra
      options: bhv.options || {},
    };
  }

  __behaviour(opts = {}) {
    return (this._bhv = {
      ...(this._bhv || {}),
      ...opts,
    });
  }

  __getBehaviour(opts = {}) {
    return this._bhv || {};
  }

  destroy() {
    this.all.stopListening();
    this.all.reset();
    this.assetsVis.stopListening();
    this.assetsVis.reset();
    this.fu?.remove();
    this.am?.remove();
    this._bhv = {};
  }
}
