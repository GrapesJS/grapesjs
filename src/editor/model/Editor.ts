import { isUndefined, isArray, contains, toArray, keys, bindAll } from 'underscore';
import Backbone from 'backbone';
import $ from '../../utils/cash-dom';
import Extender from '../../utils/extender';
import { hasWin, isEmptyObj, wait } from '../../utils/mixins';
import { AddOptions, Model, ObjectAny } from '../../common';
import Selected from './Selected';
import FrameView from '../../canvas/view/FrameView';
import Editor from '..';
import EditorView from '../view/EditorView';
import { ILoadableModule, IModule, IStorableModule } from '../../abstract/Module';
import CanvasModule from '../../canvas';
import ComponentManager from '../../dom_components';
import CssComposer from '../../css_composer';
import { EditorConfig, EditorConfigKeys } from '../config/config';
import Component from '../../dom_components/model/Component';
import BlockManager from '../../block_manager';
import SelectorManager from '../../selector_manager';
import ParserModule from '../../parser';
import StorageManager from '../../storage_manager';
import TraitManager from '../../trait_manager';
import LayerManager from '../../navigator';
import AssetManager from '../../asset_manager';
import DeviceManager from '../../device_manager';
import PageManager from '../../pages';
import I18nModule from '../../i18n';
import UtilsModule from '../../utils';
import KeymapsModule from '../../keymaps';
import ModalModule from '../../modal_dialog';
import PanelManager from '../../panels';
import CodeManagerModule from '../../code_manager';
import UndoManagerModule from '../../undo_manager';
import RichTextEditorModule from '../../rich_text_editor';
import CommandsModule from '../../commands';
import StyleManager from '../../style_manager';
import CssRule from '../../css_composer/model/CssRule';
import { HTMLGeneratorBuildOptions } from '../../code_manager/model/HtmlGenerator';
import { CssGeneratorBuildOptions } from '../../code_manager/model/CssGenerator';
import ComponentView from '../../dom_components/view/ComponentView';
import { ProjectData, StorageOptions } from '../../storage_manager/model/IStorage';
import CssRules from '../../css_composer/model/CssRules';
import { ComponentAdd, DragMode } from '../../dom_components/model/types';
import ComponentWrapper from '../../dom_components/model/ComponentWrapper';
import { CanvasSpotBuiltInTypes } from '../../canvas/model/CanvasSpot';

Backbone.$ = $;

const deps: (new (em: EditorModel) => IModule)[] = [
  UtilsModule,
  I18nModule,
  KeymapsModule,
  UndoManagerModule,
  StorageManager,
  DeviceManager,
  ParserModule,
  StyleManager,
  SelectorManager,
  ModalModule,
  CodeManagerModule,
  PanelManager,
  RichTextEditorModule,
  TraitManager,
  LayerManager,
  CanvasModule,
  CommandsModule,
  BlockManager,
];
const storableDeps: (new (em: EditorModel) => IModule & IStorableModule)[] = [
  AssetManager,
  CssComposer,
  PageManager,
  ComponentManager,
];

Extender({ $ });

const logs = {
  debug: console.log,
  info: console.info,
  warning: console.warn,
  error: console.error,
};

export interface EditorLoadOptions {
  /** Clear the editor state (eg. dirty counter, undo manager, etc.). */
  clear?: boolean;
}

export default class EditorModel extends Model {
  defaults() {
    return {
      editing: 0,
      selected: 0,
      clipboard: null,
      dmode: 0,
      componentHovered: null,
      previousModel: null,
      changesCount: 0,
      storables: [],
      modules: [],
      toLoad: [],
      opened: {},
      device: '',
    };
  }

  __skip = false;
  defaultRunning = false;
  destroyed = false;
  _config: EditorConfig;
  _storageTimeout?: ReturnType<typeof setTimeout>;
  attrsOrig: any;
  timedInterval?: ReturnType<typeof setTimeout>;
  updateItr?: ReturnType<typeof setTimeout>;
  view?: EditorView;

  get storables(): IStorableModule[] {
    return this.get('storables');
  }

  get modules(): IModule[] {
    return this.get('modules');
  }

  get toLoad(): ILoadableModule[] {
    return this.get('toLoad');
  }

  get selected(): Selected {
    return this.get('selected');
  }

  get shallow(): EditorModel {
    return this.get('shallow');
  }

  get I18n(): I18nModule {
    return this.get('I18n');
  }

  get Utils(): UtilsModule {
    return this.get('Utils');
  }

  get Commands(): CommandsModule {
    return this.get('Commands');
  }

  get Keymaps(): KeymapsModule {
    return this.get('Keymaps');
  }

  get Modal(): ModalModule {
    return this.get('Modal');
  }

  get Panels(): PanelManager {
    return this.get('Panels');
  }

  get CodeManager(): CodeManagerModule {
    return this.get('CodeManager');
  }

  get UndoManager(): UndoManagerModule {
    return this.get('UndoManager');
  }

  get RichTextEditor(): RichTextEditorModule {
    return this.get('RichTextEditor');
  }

  get Canvas(): CanvasModule {
    return this.get('Canvas');
  }

  get Editor(): Editor {
    return this.get('Editor');
  }

  get Components(): ComponentManager {
    return this.get('DomComponents');
  }

  get Css(): CssComposer {
    return this.get('CssComposer');
  }

  get Blocks(): BlockManager {
    return this.get('BlockManager');
  }

  get Selectors(): SelectorManager {
    return this.get('SelectorManager');
  }

  get Storage(): StorageManager {
    return this.get('StorageManager');
  }

  get Traits(): TraitManager {
    return this.get('TraitManager');
  }

  get Parser(): ParserModule {
    return this.get('Parser');
  }

  get Layers(): LayerManager {
    return this.get('LayerManager');
  }

  get Assets(): AssetManager {
    return this.get('AssetManager');
  }

  get Devices(): DeviceManager {
    return this.get('DeviceManager');
  }

  get Pages(): PageManager {
    return this.get('PageManager');
  }

  get Styles(): StyleManager {
    return this.get('StyleManager');
  }

  constructor(conf: EditorConfig = {}) {
    super();
    this._config = conf;
    const { config } = this;
    this.set('Config', conf);
    this.set('modules', []);
    this.set('toLoad', []);
    this.set('storables', []);
    this.set('selected', new Selected());
    this.set('dmode', config.dragMode);
    const { el, log } = config;
    const toLog = log === true ? keys(logs) : isArray(log) ? log : [];
    bindAll(this, 'initBaseColorPicker');

    if (el && config.fromElement) {
      config.components = el.innerHTML;
    }

    this.attrsOrig = el
      ? toArray(el.attributes).reduce((res, next) => {
          res[next.nodeName] = next.nodeValue;
          return res;
        }, {} as Record<string, any>)
      : '';

    // Move components to pages
    if (config.components && !config.pageManager) {
      config.pageManager = { pages: [{ component: config.components }] };
    }

    // Load modules
    deps.forEach(constr => this.loadModule(constr));
    storableDeps.forEach(constr => this.loadStorableModule(constr));
    this.on('change:componentHovered', this.componentHovered, this);
    this.on('change:changesCount', this.updateChanges, this);
    this.on('change:readyLoad change:readyCanvas', this._checkReady, this);
    toLog.forEach(e => this.listenLog(e));

    // Deprecations
    [{ from: 'change:selectedComponent', to: 'component:toggled' }].forEach(event => {
      const eventFrom = event.from;
      const eventTo = event.to;
      this.listenTo(this, eventFrom, (...args) => {
        this.trigger(eventTo, ...args);
        this.logWarning(`The event '${eventFrom}' is deprecated, replace it with '${eventTo}'`);
      });
    });
  }

  _checkReady() {
    if (this.get('readyLoad') && this.get('readyCanvas') && !this.get('ready')) {
      this.set('ready', true);
    }
  }

  getContainer() {
    return this.config.el;
  }

  listenLog(event: string) {
    //@ts-ignore
    this.listenTo(this, `log:${event}`, logs[event]);
  }

  get config() {
    return this._config;
  }

  /**
   * Get configurations
   * @param  {string} [prop] Property name
   * @return {any} Returns the configuration object or
   *  the value of the specified property
   */
  getConfig<
    P extends EditorConfigKeys | undefined = undefined,
    R = P extends EditorConfigKeys ? EditorConfig[P] : EditorConfig
  >(prop?: P): R {
    const { config } = this;
    // @ts-ignore
    return isUndefined(prop) ? config : config[prop];
  }

  /**
   * Should be called once all modules and plugins are loaded
   * @private
   */
  loadOnStart() {
    const { projectData, headless } = this.config;
    const sm = this.Storage;

    // In `onLoad`, the module will try to load the data from its configurations.
    this.toLoad.reverse().forEach(mdl => mdl.onLoad());

    // Stuff to do post load
    const postLoad = () => {
      this.modules.forEach(mdl => mdl.postLoad && mdl.postLoad(this));
      this.set('readyLoad', 1);
    };

    if (headless) {
      projectData && this.loadData(projectData);
      postLoad();
    } else {
      // Defer for storage load events.
      this._storageTimeout = setTimeout(async () => {
        if (projectData) {
          this.loadData(projectData);
        } else if (sm?.canAutoload()) {
          try {
            await this.load();
          } catch (error) {
            this.logError(error as string);
          }
        }
        postLoad();
      });
    }

    // Create shallow editor.
    // Here we can create components/styles without altering/triggering the main EditorModel
    const shallow = new EditorModel({
      noticeOnUnload: false,
      storageManager: false,
      undoManager: false,
    });
    // We only need to load a few modules
    shallow.Pages.onLoad();
    shallow.Canvas.postLoad();
    this.set('shallow', shallow);
  }

  /**
   * Set the alert before unload in case it's requested
   * and there are unsaved changes
   * @private
   */
  updateChanges(m: any, v: any, opts: ObjectAny) {
    const stm = this.Storage;
    const changes = this.getDirtyCount();

    if (!opts.isClear) {
      this.updateItr && clearTimeout(this.updateItr);
      this.updateItr = setTimeout(() => this.trigger('update'));
    }

    if (this.config.noticeOnUnload) {
      window.onbeforeunload = changes ? () => true : null;
    }

    if (stm.isAutosave() && changes >= stm.getStepsBeforeSave()) {
      this.store().catch(err => this.logError(err));
    }
  }

  /**
   * Load generic module
   */
  private loadModule(InitModule: new (em: EditorModel) => IModule) {
    const Mod = new InitModule(this);
    this.set(Mod.name, Mod);
    Mod.onLoad && this.toLoad.push(Mod as ILoadableModule);
    this.modules.push(Mod);
    return Mod;
  }

  private loadStorableModule(InitModule: new (em: EditorModel) => IModule & IStorableModule) {
    const Mod = this.loadModule(InitModule) as IModule & IStorableModule;
    this.storables.push(Mod);
    return Mod;
  }

  /**
   * Initialize editor model and set editor instance
   * @param {Editor} editor Editor instance
   * @return {this}
   * @public
   */
  init(editor: Editor, opts = {}) {
    if (this.destroyed) {
      this.initialize(opts);
      this.destroyed = false;
    }
    this.set('Editor', editor);
  }

  getEditor(): Editor {
    return this.get('Editor');
  }

  /**
   * This method handles updates on the editor and tries to store them
   * if requested and if the changesCount is exceeded
   * @param  {Object} model
   * @param  {any} val  Value
   * @param  {Object} opt  Options
   * @private
   * */
  handleUpdates(model: any, val: any, opt: any = {}) {
    // Component has been added temporarily - do not update storage or record changes
    if (this.__skip || opt.temporary || opt.noCount || opt.avoidStore || !this.get('ready')) {
      return;
    }

    this.timedInterval && clearTimeout(this.timedInterval);
    this.timedInterval = setTimeout(() => {
      const curr = this.getDirtyCount() || 0;
      const { unset, ...opts } = opt;
      this.set('changesCount', curr + 1, opts);
    }, 0);
  }

  changesUp(opts: any) {
    this.handleUpdates(0, 0, opts);
  }

  /**
   * Callback on component hover
   * @param   {Object}   Model
   * @param   {Mixed}   New value
   * @param   {Object}   Options
   * @private
   * */
  componentHovered(editor: any, component: any, options: any) {
    const prev = this.previous('componentHovered');
    prev && this.trigger('component:unhovered', prev, options);
    component && this.trigger('component:hovered', component, options);
  }

  /**
   * Returns model of the selected component
   * @return {Component|null}
   * @public
   */
  getSelected() {
    return this.selected.lastComponent();
  }

  /**
   * Returns an array of all selected components
   * @return {Array}
   * @public
   */
  getSelectedAll() {
    return this.selected.allComponents();
  }

  /**
   * Select a component
   * @param  {Component} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @public
   */
  setSelected(el?: Component | Component[], opts: any = {}) {
    const { event } = opts;
    const ctrlKey = event && (event.ctrlKey || event.metaKey);
    const { shiftKey } = event || {};
    const models = (isArray(el) ? el : [el])
      .map(cmp => cmp?.delegate?.select?.(cmp) || cmp)
      .filter(Boolean) as Component[];
    const selected = this.getSelectedAll();
    const mltSel = this.getConfig().multipleSelection;
    const multiple = isArray(el);

    if (multiple || !el) {
      this.removeSelected(selected.filter(s => !contains(models, s)));
    }

    models.forEach(model => {
      if (model) {
        this.trigger('component:select:before', model, opts);

        // Check for valid selectable
        if (!model.get('selectable') || opts.abort) {
          if (opts.useValid) {
            let parent = model.parent();
            while (parent && !parent.get('selectable')) parent = parent.parent();
            model = parent!;
          } else {
            return;
          }
        }
      }

      // Hanlde multiple selection
      if (ctrlKey && mltSel) {
        return this.toggleSelected(model);
      } else if (shiftKey && mltSel) {
        this.clearSelection(this.Canvas.getWindow());
        const coll = model.collection;
        const index = model.index();
        let min: number | undefined, max: number | undefined;

        // Fin min and max siblings
        this.getSelectedAll().forEach(sel => {
          const selColl = sel.collection;
          const selIndex = sel.index();
          if (selColl === coll) {
            if (selIndex < index) {
              // First model BEFORE the selected one
              min = isUndefined(min) ? selIndex : Math.max(min, selIndex);
            } else if (selIndex > index) {
              // First model AFTER the selected one
              max = isUndefined(max) ? selIndex : Math.min(max, selIndex);
            }
          }
        });

        if (!isUndefined(min)) {
          while (min !== index) {
            this.addSelected(coll.at(min));
            min++;
          }
        }

        if (!isUndefined(max)) {
          while (max !== index) {
            this.addSelected(coll.at(max));
            max--;
          }
        }

        return this.addSelected(model);
      }

      !multiple && this.removeSelected(selected.filter(s => s !== model));
      this.addSelected(model, opts);
    });
  }

  /**
   * Add component to selection
   * @param  {Component|Array<Component>} component Component to select
   * @param  {Object} [opts={}] Options, optional
   * @public
   */
  addSelected(component: Component | Component[], opts: any = {}) {
    const models: Component[] = isArray(component) ? component : [component];

    models.forEach(model => {
      const { selected } = this;
      if (
        !model ||
        !model.get('selectable') ||
        // Avoid selecting children of selected components
        model.parents().some((parent: Component) => selected.hasComponent(parent))
      ) {
        return;
      }
      opts.forceChange && this.removeSelected(model, opts);
      // Remove from selection, children of the component to select
      const toDeselect = selected.allComponents().filter(cmp => contains(cmp.parents(), model));
      toDeselect.forEach(cmp => this.removeSelected(cmp, opts));

      selected.addComponent(model, opts);
      this.trigger('component:select', model, opts);
      this.Canvas.addSpot({
        type: CanvasSpotBuiltInTypes.Select,
        component: model,
      });
    });
  }

  /**
   * Remove component from selection
   * @param  {Component|Array<Component>} component Component to select
   * @param  {Object} [opts={}] Options, optional
   * @public
   */
  removeSelected(component: Component | Component[], opts = {}) {
    this.selected.removeComponent(component, opts);
    const cmps: Component[] = isArray(component) ? component : [component];
    cmps.forEach(component =>
      this.Canvas.removeSpots({
        type: CanvasSpotBuiltInTypes.Select,
        component,
      })
    );
  }

  /**
   * Toggle component selection
   * @param  {Component|Array<Component>} component Component to select
   * @param  {Object} [opts={}] Options, optional
   * @public
   */
  toggleSelected(component: Component | Component[], opts: any = {}) {
    const models = isArray(component) ? component : [component];

    models.forEach(model => {
      if (this.selected.hasComponent(model)) {
        this.removeSelected(model, opts);
      } else {
        this.addSelected(model, opts);
      }
    });
  }

  /**
   * Hover a component
   * @param  {Component|Array<Component>} cmp Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  setHovered(cmp?: Component | null, opts: any = {}) {
    const upHovered = (cmp?: Component, opts?: any) => {
      const { config, Canvas } = this;
      const current = this.getHovered();
      const selectedAll = this.getSelectedAll();
      const typeHover = CanvasSpotBuiltInTypes.Hover;
      const typeSpacing = CanvasSpotBuiltInTypes.Spacing;
      this.set('componentHovered', cmp || null, opts);

      if (current) {
        Canvas.removeSpots({ type: typeHover, component: current });
        Canvas.removeSpots({ type: typeSpacing, component: current });
      }

      if (cmp) {
        Canvas.addSpot({ type: typeHover, component: cmp });
        if (!selectedAll.includes(cmp) || config.showOffsetsSelected) {
          Canvas.addSpot({ type: typeSpacing, component: cmp });
        }
      }
    };

    if (!cmp) {
      return upHovered();
    }

    const ev = 'component:hover';
    opts.forceChange && upHovered();
    this.trigger(`${ev}:before`, cmp, opts);

    // Check for valid hoverable
    if (!cmp.get('hoverable')) {
      if (opts.useValid && !opts.abort) {
        let parent = cmp.parent();
        while (parent && !parent.get('hoverable')) parent = parent.parent();
        cmp = parent;
      } else {
        return;
      }
    }

    if (!opts.abort) {
      upHovered(cmp, opts);
      this.trigger(ev, cmp, opts);
    }
  }

  getHovered() {
    return this.get('componentHovered') as Component | undefined;
  }

  /**
   * Set components inside editor's canvas. This method overrides actual components
   * @param {Object|string} components HTML string or components model
   * @param {Object} opt the options object to be used by the [setComponents]{@link setComponents} method
   * @return {this}
   * @public
   */
  setComponents(components: ComponentAdd, opt: AddOptions = {}) {
    return this.Components.setComponents(components, opt);
  }

  /**
   * Returns components model from the editor's canvas
   * @return {Components}
   * @private
   */
  getComponents() {
    const cmp = this.Components;
    const cm = this.CodeManager;

    if (!cmp || !cm) return;

    const wrp = cmp.getComponents();
    return cm.getCode(wrp, 'json');
  }

  /**
   * Set style inside editor's canvas. This method overrides actual style
   * @param {Object|string} style CSS string or style model
   * @param {Object} opt the options object to be used by the `CssRules.add` method
   * @return {this}
   * @public
   */
  setStyle(style: any, opt = {}) {
    const cssc = this.Css;
    cssc.clear(opt);
    cssc.getAll().add(style, opt);
    return this;
  }

  /**
   * Add styles to the editor
   * @param {Array<Object>|Object|string} style CSS string or style model
   * @returns {Array<CssRule>}
   * @public
   */
  addStyle(style: any, opts = {}): CssRule[] {
    const res = this.getStyle().add(style, opts);
    return isArray(res) ? res : [res];
  }

  /**
   * Returns rules/style model from the editor's canvas
   * @return {Rules}
   * @private
   */
  getStyle(): CssRules {
    return this.Css.getAll();
  }

  /**
   * Change the selector state
   * @param {String} value State value
   * @returns {this}
   */
  setState(value: string) {
    this.set('state', value);
    return this;
  }

  /**
   * Get the current selector state
   * @returns {String}
   */
  getState(): string {
    return this.get('state') || '';
  }

  /**
   * Returns HTML built inside canvas
   * @param {Object} [opts={}] Options
   * @returns {string} HTML string
   * @public
   */
  getHtml(opts: { component?: Component } & HTMLGeneratorBuildOptions = {}): string {
    const { config } = this;
    const { optsHtml } = config;
    const js = config.jsInHtml ? this.getJs(opts) : '';
    const cmp = opts.component || this.Components.getComponent();
    let html = cmp
      ? this.CodeManager.getCode(cmp, 'html', {
          ...optsHtml,
          ...opts,
        })
      : '';
    html += js ? `<script>${js}</script>` : '';
    return html;
  }

  /**
   * Returns CSS built inside canvas
   * @param {Object} [opts={}] Options
   * @returns {string} CSS string
   * @public
   */
  getCss(opts: { component?: Component; avoidProtected?: boolean } & CssGeneratorBuildOptions = {}) {
    const { config } = this;
    const { optsCss } = config;
    const avoidProt = opts.avoidProtected;
    const keepUnusedStyles = !isUndefined(opts.keepUnusedStyles) ? opts.keepUnusedStyles : config.keepUnusedStyles;
    const cssc = this.Css;
    const wrp = opts.component || this.Components.getComponent();
    const protCss = !avoidProt ? config.protectedCss! : '';
    const css =
      wrp &&
      this.CodeManager.getCode(wrp, 'css', {
        cssc,
        keepUnusedStyles,
        ...optsCss,
        ...opts,
      });
    return wrp ? (opts.json ? css : protCss + css) : '';
  }

  /**
   * Returns JS of all components
   * @return {string} JS string
   * @public
   */
  getJs(opts: { component?: Component } = {}) {
    var wrp = opts.component || this.Components.getWrapper();
    return wrp ? this.CodeManager.getCode(wrp, 'js').trim() : '';
  }

  /**
   * Store data to the current storage.
   * @public
   */
  async store<T extends StorageOptions>(options?: T) {
    const data = this.storeData();
    await this.Storage.store(data, options);
    this.clearDirtyCount();
    return data;
  }

  /**
   * Load data from the current storage.
   * @public
   */
  async load<T extends StorageOptions>(options?: T, loadOptions: EditorLoadOptions = {}) {
    const result = await this.Storage.load(options);
    this.loadData(result);
    // Wait in order to properly update the dirty counter (#5385)
    await wait();

    if (loadOptions.clear) {
      this.UndoManager.clear();
      this.clearDirtyCount();
    }

    return result;
  }

  storeData(): ProjectData {
    let result = {};
    // Sync content if there is an active RTE
    const editingCmp = this.getEditing();
    editingCmp && editingCmp.trigger('sync:content', { noCount: true });

    this.storables.forEach(m => {
      result = { ...result, ...m.store(1) };
    });
    return JSON.parse(JSON.stringify(result));
  }

  loadData(data: ProjectData = {}): ProjectData {
    if (!isEmptyObj(data)) {
      this.storables.forEach(module => module.clear());
      this.storables.forEach(module => module.load(data));
    }
    return data;
  }

  /**
   * Returns device model by name
   * @return {Device|null}
   * @private
   */
  getDeviceModel() {
    const name = this.get('device');
    return this.Devices.get(name);
  }

  /**
   * Run default command if setted
   * @param {Object} [opts={}] Options
   * @private
   */
  runDefault(opts = {}) {
    const command = this.get('Commands').get(this.config.defaultCommand);
    if (!command || this.defaultRunning) return;
    command.stop(this, this, opts);
    command.run(this, this, opts);
    this.defaultRunning = true;
  }

  /**
   * Stop default command
   * @param {Object} [opts={}] Options
   * @private
   */
  stopDefault(opts = {}) {
    const commands = this.get('Commands');
    const command = commands.get(this.config.defaultCommand);
    if (!command || !this.defaultRunning) return;
    command.stop(this, this, opts);
    this.defaultRunning = false;
  }

  /**
   * Update canvas dimensions and refresh data useful for tools positioning
   * @public
   */
  refreshCanvas(opts: any = {}) {
    this.Canvas.refresh({ spots: opts.tools });
  }

  /**
   * Clear all selected stuf inside the window, sometimes is useful to call before
   * doing some dragging opearation
   * @param {Window} win If not passed the current one will be used
   * @private
   */
  clearSelection(win?: Window) {
    var w = win || window;
    w.getSelection()?.removeAllRanges();
  }

  /**
   * Get the current media text
   * @return {string}
   */
  getCurrentMedia() {
    const config = this.config;
    const device = this.getDeviceModel();
    const condition = config.mediaCondition;
    const preview = config.devicePreviewMode;
    const width = device && device.get('widthMedia');
    return device && width && !preview ? `(${condition}: ${width})` : '';
  }

  /**
   * Return the component wrapper
   * @return {Component}
   */
  getWrapper(): ComponentWrapper | undefined {
    return this.Components.getWrapper();
  }

  setCurrentFrame(frameView?: FrameView) {
    return this.set('currentFrame', frameView);
  }

  getCurrentFrame(): FrameView | undefined {
    return this.get('currentFrame');
  }

  getCurrentFrameModel() {
    return (this.getCurrentFrame() || {})?.model;
  }

  getIcon(icon: string) {
    const icons = this.config.icons || {};
    return icons[icon] || '';
  }

  /**
   * Return the count of changes made to the content and not yet stored.
   * This count resets at any `store()`
   * @return {number}
   */
  getDirtyCount(): number {
    return this.get('changesCount');
  }

  clearDirtyCount() {
    return this.set({ changesCount: 0 }, { isClear: true });
  }

  getZoomDecimal() {
    return this.Canvas.getZoomDecimal();
  }

  getZoomMultiplier() {
    return this.Canvas.getZoomMultiplier();
  }

  setDragMode(value: DragMode) {
    return this.set('dmode', value);
  }

  getDragMode(component?: Component): DragMode {
    const mode = component?.getDragMode() || this.get('dmode');
    return mode || '';
  }

  t(...args: any[]) {
    const i18n = this.get('I18n');
    return i18n?.t(...args);
  }

  /**
   * Returns true if the editor is in absolute mode
   * @returns {Boolean}
   */
  inAbsoluteMode(component?: Component) {
    return this.getDragMode(component) === 'absolute';
  }

  /**
   * Destroy editor
   */
  destroyAll() {
    const { config, view } = this;
    const editor = this.getEditor();
    // @ts-ignore
    const { editors = [] } = config.grapesjs || {};
    const shallow = this.get('shallow');
    this._storageTimeout && clearTimeout(this._storageTimeout);
    shallow?.destroyAll();
    this.stopListening();
    this.stopDefault();
    this.modules
      .slice()
      .reverse()
      .forEach(mod => mod.destroy());
    view && view.remove();
    this.clear({ silent: true });
    this.destroyed = true;
    ['_config', 'view', '_previousAttributes', '_events', '_listeners'].forEach(
      //@ts-ignore
      i => (this[i] = {})
    );
    editors.splice(editors.indexOf(editor), 1);
    //@ts-ignore
    hasWin() && $(config.el).empty().attr(this.attrsOrig);
  }

  getEditing(): Component | undefined {
    const res = this.get('editing');
    return (res && res.model) || undefined;
  }

  setEditing(value: boolean | ComponentView) {
    this.set('editing', value);
    return this;
  }

  isEditing() {
    return !!this.get('editing');
  }

  log(msg: string, opts: any = {}) {
    const { ns, level = 'debug' } = opts;
    this.trigger('log', msg, opts);
    level && this.trigger(`log:${level}`, msg, opts);

    if (ns) {
      const logNs = `log-${ns}`;
      this.trigger(logNs, msg, opts);
      level && this.trigger(`${logNs}:${level}`, msg, opts);
    }
  }

  logInfo(msg: string, opts?: any) {
    this.log(msg, { ...opts, level: 'info' });
  }

  logWarning(msg: string, opts?: any) {
    this.log(msg, { ...opts, level: 'warning' });
  }

  logError(msg: string, opts?: any) {
    this.log(msg, { ...opts, level: 'error' });
  }

  initBaseColorPicker(el: any, opts = {}) {
    const { config } = this;
    const { colorPicker = {} } = config;
    const elToAppend = config.el;
    const ppfx = config.stylePrefix;

    //@ts-ignore
    return $(el).spectrum({
      containerClassName: `${ppfx}one-bg ${ppfx}two-color`,
      appendTo: elToAppend || 'body',
      maxSelectionSize: 8,
      showPalette: true,
      palette: [],
      showAlpha: true,
      chooseText: 'Ok',
      cancelText: '⨯',
      ...opts,
      ...colorPicker,
    });
  }

  /**
   * Execute actions without triggering the storage and undo manager.
   * @param  {Function} clb
   * @private
   */
  skip(clb: Function) {
    this.__skip = true;
    const um = this.UndoManager;
    um ? um.skip(clb) : clb();
    this.__skip = false;
  }

  /**
   * Set/get data from the HTMLElement
   * @param  {HTMLElement} el
   * @param  {string} name Data name
   * @param  {any} value Date value
   * @return {any}
   * @private
   */
  data(el: any, name: string, value: any) {
    const varName = '_gjs-data';

    if (!el[varName]) {
      el[varName] = {};
    }

    if (isUndefined(value)) {
      return el[varName][name];
    } else {
      el[varName][name] = value;
    }
  }
}
