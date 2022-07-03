import { isUndefined, isArray, contains, toArray, keys, bindAll } from 'underscore';
import Backbone from 'backbone';
import $ from '../../utils/cash-dom';
import Extender from '../../utils/extender';
import { getModel, hasWin, isEmptyObj } from '../../utils/mixins';
import { Model } from '../../common';
import Selected from './Selected';
import FrameView from '../../canvas/view/FrameView';
import EditorModule from '..';
import EditorView from '../view/EditorView';
import { IModule } from '../../abstract/Module';

//@ts-ignore
Backbone.$ = $;

const deps = [
  require('utils'),
  require('i18n'),
  require('keymaps'),
  require('undo_manager'),
  require('storage_manager'),
  require('device_manager'),
  require('parser'),
  require('style_manager'),
  require('selector_manager'),
  require('modal_dialog'),
  require('code_manager'),
  require('panels'),
  require('rich_text_editor'),
  require('asset_manager'),
  require('css_composer'),
  require('pages'),
  require('trait_manager'),
  require('dom_components'),
  require('navigator'),
  require('canvas'),
  require('commands'),
  require('block_manager'),
];

const ts_deps: any[] = [];

Extender({
  //@ts-ignore
  Backbone: Backbone,
  $: Backbone.$,
});

const logs = {
  debug: console.log,
  info: console.info,
  warning: console.warn,
  error: console.error,
};

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
  _config: any;
  attrsOrig: any;
  timedInterval?: number;
  updateItr?: number;
  view?: EditorView;

  get storables(): any[] {
    return this.get('storables');
  }

  get modules(): IModule[] {
    return this.get('modules');
  }

  get toLoad(): any[] {
    return this.get('toLoad');
  }

  get selected(): Selected {
    return this.get('selected');
  }

  get shallow(): EditorModel {
    return this.get('shallow');
  }

  constructor(conf = {}) {
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
        }, {})
      : '';

    // Move components to pages
    if (config.components && !config.pageManager) {
      config.pageManager = { pages: [{ component: config.components }] };
    }

    // Load modules
    deps.forEach(name => this.loadModule(name));
    ts_deps.forEach(name => this.tsLoadModule(name));
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
  getConfig(prop?: string) {
    const config = this.config;
    return isUndefined(prop) ? config : config[prop];
  }

  /**
   * Should be called once all modules and plugins are loaded
   * @private
   */
  loadOnStart() {
    const { projectData, headless } = this.config;
    const sm = this.get('StorageManager');

    // In `onLoad`, the module will try to load the data from its configurations.
    this.toLoad.forEach(mdl => mdl.onLoad());

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
      setTimeout(async () => {
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
    ['PageManager', 'Canvas'].forEach(key => shallow.get(key).onLoad());
    this.set('shallow', shallow);
  }

  /**
   * Set the alert before unload in case it's requested
   * and there are unsaved changes
   * @private
   */
  updateChanges() {
    const stm = this.get('StorageManager');
    const changes = this.getDirtyCount();
    this.updateItr && clearTimeout(this.updateItr);
    //@ts-ignore
    this.updateItr = setTimeout(() => this.trigger('update'));

    if (this.config.noticeOnUnload) {
      window.onbeforeunload = changes ? () => true : null;
    }

    if (stm.isAutosave() && changes >= stm.getStepsBeforeSave()) {
      this.store().catch(err => this.logError(err));
    }
  }

  /**
   * Load generic module
   * @param {String} moduleName Module name
   * @return {this}
   * @private
   */
  loadModule(moduleName: any) {
    const { config } = this;
    const Module = moduleName.default || moduleName;
    const Mod = new Module(this);
    const name = Mod.name.charAt(0).toLowerCase() + Mod.name.slice(1);
    const cfgParent = !isUndefined(config[name]) ? config[name] : config[Mod.name];
    const cfg = cfgParent === true ? {} : cfgParent || {};
    cfg.pStylePrefix = config.pStylePrefix || '';

    if (!isUndefined(cfgParent) && !cfgParent) {
      cfg._disable = 1;
    }

    if (Mod.storageKey && Mod.store && Mod.load) {
      this.storables.push(Mod);
    }

    cfg.em = this;
    Mod.init({ ...cfg });

    // Bind the module to the editor model if public
    !Mod.private && this.set(Mod.name, Mod);
    Mod.onLoad && this.toLoad.push(Mod);
    this.modules.push(Mod);
    return this;
  }

  /**
   * Load generic module
   * @param {String} moduleName Module name
   * @return {this}
   * @private
   */
  tsLoadModule(moduleName: any) {
    const Module = moduleName.default || moduleName;
    const Mod = new Module(this);

    if (Mod.storageKey && Mod.store && Mod.load) {
      this.storables.push(Mod);
    }

    // Bind the module to the editor model if public
    !Mod.private && this.set(Mod.name, Mod);
    Mod.onLoad && this.toLoad.push(Mod);
    this.modules.push(Mod);
    return this;
  }
  /**
   * Initialize editor model and set editor instance
   * @param {Editor} editor Editor instance
   * @return {this}
   * @public
   */
  init(editor: EditorModule, opts = {}) {
    if (this.destroyed) {
      this.initialize(opts);
      this.destroyed = false;
    }
    this.set('Editor', editor);
  }

  getEditor() {
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
    //@ts-ignore
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
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @public
   */
  setSelected(el?: any | any[], opts: any = {}) {
    const { event } = opts;
    const ctrlKey = event && (event.ctrlKey || event.metaKey);
    const { shiftKey } = event || {};
    const els = (isArray(el) ? el : [el]).map(el => getModel(el, $));
    const selected = this.getSelectedAll();
    const mltSel = this.getConfig().multipleSelection;
    let added;

    // If an array is passed remove all selected
    // expect those yet to be selected
    const multiple = isArray(el);
    multiple && this.removeSelected(selected.filter(s => !contains(els, s)));

    els.forEach(el => {
      let model = getModel(el, undefined);

      if (model) {
        this.trigger('component:select:before', model, opts);

        // Check for valid selectable
        if (!model.get('selectable') || opts.abort) {
          if (opts.useValid) {
            let parent = model.parent();
            while (parent && !parent.get('selectable')) parent = parent.parent();
            model = parent;
          } else {
            return;
          }
        }
      }

      // Hanlde multiple selection
      if (ctrlKey && mltSel) {
        return this.toggleSelected(model);
      } else if (shiftKey && mltSel) {
        this.clearSelection(this.get('Canvas').getWindow());
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
      added = model;
    });
  }

  /**
   * Add component to selection
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @public
   */
  addSelected(el: any, opts: any = {}) {
    const model = getModel(el, $);
    const models = isArray(model) ? model : [model];

    models.forEach(model => {
      if (model && !model.get('selectable')) return;
      const { selected } = this;
      opts.forceChange && this.removeSelected(model, opts);
      selected.addComponent(model, opts);
      model && this.trigger('component:select', model, opts);
    });
  }

  /**
   * Remove component from selection
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @public
   */
  removeSelected(el: any, opts = {}) {
    this.selected.removeComponent(getModel(el, $), opts);
  }

  /**
   * Toggle component selection
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @public
   */
  toggleSelected(el: any, opts = {}) {
    const model = getModel(el, $);
    const models = isArray(model) ? model : [model];

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
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  setHovered(el: any, opts: any = {}) {
    if (!el) return this.set('componentHovered', '');

    const ev = 'component:hover';
    let model = getModel(el, undefined);

    if (!model) return;

    opts.forceChange && this.set('componentHovered', '');
    this.trigger(`${ev}:before`, model, opts);

    // Check for valid hoverable
    if (!model.get('hoverable')) {
      if (opts.useValid && !opts.abort) {
        let parent = model && model.parent();
        while (parent && !parent.get('hoverable')) parent = parent.parent();
        model = parent;
      } else {
        return;
      }
    }

    if (!opts.abort) {
      this.set('componentHovered', model, opts);
      this.trigger(ev, model, opts);
    }
  }

  getHovered() {
    return this.get('componentHovered');
  }

  /**
   * Set components inside editor's canvas. This method overrides actual components
   * @param {Object|string} components HTML string or components model
   * @param {Object} opt the options object to be used by the [setComponents]{@link setComponents} method
   * @return {this}
   * @public
   */
  setComponents(components: any, opt = {}) {
    return this.get('DomComponents').setComponents(components, opt);
  }

  /**
   * Returns components model from the editor's canvas
   * @return {Components}
   * @private
   */
  getComponents() {
    var cmp = this.get('DomComponents');
    var cm = this.get('CodeManager');

    if (!cmp || !cm) return;

    var wrp = cmp.getComponents();
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
    const cssc = this.get('CssComposer');
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
  addStyle(style: any, opts = {}) {
    const res = this.getStyle().add(style, opts);
    return isArray(res) ? res : [res];
  }

  /**
   * Returns rules/style model from the editor's canvas
   * @return {Rules}
   * @private
   */
  getStyle() {
    return this.get('CssComposer').getAll();
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
  getState() {
    return this.get('state') || '';
  }

  /**
   * Returns HTML built inside canvas
   * @param {Object} [opts={}] Options
   * @returns {string} HTML string
   * @public
   */
  getHtml(opts: any = {}) {
    const { config } = this;
    const { optsHtml } = config;
    const js = config.jsInHtml ? this.getJs(opts) : '';
    const cmp = opts.component || this.get('DomComponents').getComponent();
    let html = cmp
      ? this.get('CodeManager').getCode(cmp, 'html', {
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
  getCss(opts: any = {}) {
    const config = this.config;
    const { optsCss } = config;
    const avoidProt = opts.avoidProtected;
    const keepUnusedStyles = !isUndefined(opts.keepUnusedStyles) ? opts.keepUnusedStyles : config.keepUnusedStyles;
    const cssc = this.get('CssComposer');
    const wrp = opts.component || this.get('DomComponents').getComponent();
    const protCss = !avoidProt ? config.protectedCss : '';
    const css =
      wrp &&
      this.get('CodeManager').getCode(wrp, 'css', {
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
  getJs(opts: any = {}) {
    var wrp = opts.component || this.get('DomComponents').getWrapper();
    return wrp ? this.get('CodeManager').getCode(wrp, 'js').trim() : '';
  }

  /**
   * Store data to the current storage.
   * @public
   */
  async store(options?: any) {
    const data = this.storeData();
    await this.get('StorageManager').store(data, options);
    this.clearDirtyCount();
    return data;
  }

  /**
   * Load data from the current storage.
   * @public
   */
  async load(options?: any) {
    const result = await this.get('StorageManager').load(options);
    this.loadData(result);
    return result;
  }

  storeData() {
    let result = {};
    // Sync content if there is an active RTE
    const editingCmp = this.getEditing();
    editingCmp && editingCmp.trigger('sync:content', { noCount: true });

    this.storables.forEach(m => {
      result = { ...result, ...m.store(1) };
    });
    return JSON.parse(JSON.stringify(result));
  }

  loadData(data = {}) {
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
    var name = this.get('device');
    return this.get('DeviceManager').get(name);
  }

  /**
   * Run default command if setted
   * @param {Object} [opts={}] Options
   * @private
   */
  runDefault(opts = {}) {
    var command = this.get('Commands').get(this.config.defaultCommand);
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
    this.set('canvasOffset', null);
    this.set('canvasOffset', this.get('Canvas').getOffset());
    opts.tools && this.trigger('canvas:updateTools');
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
  getWrapper() {
    return this.get('DomComponents').getWrapper();
  }

  setCurrentFrame(frameView?: FrameView) {
    return this.set('currentFrame', frameView);
  }

  getCurrentFrame(): FrameView {
    return this.get('currentFrame');
  }

  getCurrentFrameModel() {
    return (this.getCurrentFrame() || {}).model;
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
    return this.set('changesCount', 0);
  }

  getZoomDecimal() {
    return this.get('Canvas').getZoomDecimal();
  }

  getZoomMultiplier() {
    return this.get('Canvas').getZoomMultiplier();
  }

  setDragMode(value: string) {
    return this.set('dmode', value);
  }

  t(...args: any[]) {
    const i18n = this.get('I18n');
    return i18n?.t(...args);
  }

  /**
   * Returns true if the editor is in absolute mode
   * @returns {Boolean}
   */
  inAbsoluteMode() {
    return this.get('dmode') === 'absolute';
  }

  /**
   * Destroy editor
   */
  destroyAll() {
    const { config, view } = this;
    const editor = this.getEditor();
    const { editors = [] } = config.grapesjs || {};
    const shallow = this.get('shallow');
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

  getEditing() {
    const res = this.get('editing');
    return (res && res.model) || null;
  }

  setEditing(value: boolean) {
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
    const um = this.get('UndoManager');
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
