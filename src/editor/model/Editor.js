import {
  isUndefined,
  isFunction,
  isArray,
  contains,
  toArray,
  keys,
  bindAll
} from 'underscore';
import $ from 'cash-dom';
import Backbone from 'backbone';
import Extender from 'utils/extender';
import { getModel, hasWin } from 'utils/mixins';
import Selected from './Selected';

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
  require('block_manager')
];

const { Collection } = Backbone;
let timedInterval;
let updateItr;

Extender({
  Backbone: Backbone,
  $: Backbone.$
});

const logs = {
  debug: console.log,
  info: console.info,
  warning: console.warn,
  error: console.error
};

export default Backbone.Model.extend({
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
      device: ''
    };
  },

  initialize(c = {}) {
    this.config = c;
    this.set('Config', c);
    this.set('modules', []);
    this.set('toLoad', []);
    this.set('storables', []);
    this.set('selected', new Selected());
    this.set('dmode', c.dragMode);
    this.set('hasPages', !!c.pageManager);
    const el = c.el;
    const log = c.log;
    const toLog = log === true ? keys(logs) : isArray(log) ? log : [];
    bindAll(this, 'initBaseColorPicker');

    if (el && c.fromElement) this.config.components = el.innerHTML;
    this.attrsOrig = el
      ? toArray(el.attributes).reduce((res, next) => {
          res[next.nodeName] = next.nodeValue;
          return res;
        }, {})
      : '';

    // Load modules
    deps.forEach(name => this.loadModule(name));
    this.on('change:componentHovered', this.componentHovered, this);
    this.on('change:changesCount', this.updateChanges, this);
    this.on('change:readyLoad change:readyCanvas', this._checkReady, this);
    toLog.forEach(e => this.listenLog(e));

    // Deprecations
    [{ from: 'change:selectedComponent', to: 'component:toggled' }].forEach(
      event => {
        const eventFrom = event.from;
        const eventTo = event.to;
        this.listenTo(this, eventFrom, (...args) => {
          this.trigger(eventTo, ...args);
          this.logWarning(
            `The event '${eventFrom}' is deprecated, replace it with '${eventTo}'`
          );
        });
      }
    );
  },

  _checkReady() {
    if (
      this.get('readyLoad') &&
      this.get('readyCanvas') &&
      !this.get('ready')
    ) {
      this.set('ready', 1);
    }
  },

  getContainer() {
    return this.config.el;
  },

  listenLog(event) {
    this.listenTo(this, `log:${event}`, logs[event]);
  },

  /**
   * Get configurations
   * @param  {string} [prop] Property name
   * @return {any} Returns the configuration object or
   *  the value of the specified property
   */
  getConfig(prop) {
    const config = this.config;
    return isUndefined(prop) ? config : config[prop];
  },

  /**
   * Should be called after all modules and plugins are loaded
   * @param {Function} clb
   * @private
   */
  loadOnStart(clb = null) {
    const sm = this.get('StorageManager');

    // Generally, with `onLoad`, the module will try to load the data from
    // its configurations
    this.get('toLoad').forEach(module => {
      module.onLoad();
    });

    // Stuff to do post load
    const postLoad = () => {
      const modules = this.get('modules');
      modules.forEach(module => module.postLoad && module.postLoad(this));
      this.set('readyLoad', 1);
      clb && clb();
    };

    if (sm && sm.canAutoload()) {
      this.load(postLoad);
    } else {
      postLoad();
    }
  },

  /**
   * Set the alert before unload in case it's requested
   * and there are unsaved changes
   * @private
   */
  updateChanges() {
    const stm = this.get('StorageManager');
    const changes = this.get('changesCount');
    updateItr && clearTimeout(updateItr);
    updateItr = setTimeout(() => this.trigger('update'));

    if (this.config.noticeOnUnload) {
      window.onbeforeunload = changes ? e => 1 : null;
    }

    if (stm.isAutosave() && changes >= stm.getStepsBeforeSave()) {
      this.store();
    }
  },

  /**
   * Load generic module
   * @param {String} moduleName Module name
   * @return {this}
   * @private
   */
  loadModule(moduleName) {
    const { config } = this;
    const Module = moduleName.default || moduleName;
    const Mod = new Module();
    const name = Mod.name.charAt(0).toLowerCase() + Mod.name.slice(1);
    const cfgParent = !isUndefined(config[name])
      ? config[name]
      : config[Mod.name];
    const cfg = cfgParent === true ? {} : cfgParent || {};
    const sm = this.get('StorageManager');
    cfg.pStylePrefix = config.pStylePrefix || '';

    if (!isUndefined(cfgParent) && !cfgParent) {
      cfg._disable = 1;
    }

    if (Mod.storageKey && Mod.store && Mod.load && sm) {
      cfg.stm = sm;
      // DomComponents should be load before CSS Composer
      const mth = name == 'domComponents' ? 'unshift' : 'push';
      this.get('storables')[mth](Mod);
    }

    cfg.em = this;
    Mod.init({ ...cfg });

    // Bind the module to the editor model if public
    !Mod.private && this.set(Mod.name, Mod);
    Mod.onLoad && this.get('toLoad').push(Mod);
    this.get('modules').push(Mod);
    return this;
  },

  /**
   * Initialize editor model and set editor instance
   * @param {Editor} editor Editor instance
   * @return {this}
   * @private
   */
  init(editor, opts = {}) {
    if (this.destroyed) {
      this.initialize(opts);
      this.destroyed = 0;
    }
    this.set('Editor', editor);
  },

  getEditor() {
    return this.get('Editor');
  },

  /**
   * This method handles updates on the editor and tries to store them
   * if requested and if the changesCount is exceeded
   * @param  {Object} model
   * @param  {any} val  Value
   * @param  {Object} opt  Options
   * @private
   * */
  handleUpdates(model, val, opt = {}) {
    // Component has been added temporarily - do not update storage or record changes
    if (opt.temporary || opt.noCount || opt.avoidStore) {
      return;
    }

    timedInterval && clearTimeout(timedInterval);
    timedInterval = setTimeout(() => {
      const curr = this.get('changesCount') || 0;
      const { unset, ...opts } = opt;
      this.set('changesCount', curr + 1, opts);
    }, 0);
  },

  changesUp(opts) {
    this.handleUpdates(0, 0, opts);
  },

  /**
   * Callback on component hover
   * @param   {Object}   Model
   * @param   {Mixed}   New value
   * @param   {Object}   Options
   * @private
   * */
  componentHovered(editor, component, options) {
    const prev = this.previous('componentHovered');
    prev && this.trigger('component:unhovered', prev, options);
    component && this.trigger('component:hovered', component, options);
  },

  /**
   * Returns model of the selected component
   * @return {Component|null}
   * @private
   */
  getSelected() {
    return this.get('selected').lastComponent();
  },

  /**
   * Returns an array of all selected components
   * @return {Array}
   * @private
   */
  getSelectedAll() {
    return this.get('selected').allComponents();
  },

  /**
   * Select a component
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  setSelected(el, opts = {}) {
    const { event } = opts;
    const ctrlKey = event && (event.ctrlKey || event.metaKey);
    const { shiftKey } = event || {};
    const multiple = isArray(el);
    const els = (multiple ? el : [el]).map(el => getModel(el, $));
    const selected = this.getSelectedAll();
    const mltSel = this.getConfig('multipleSelection');
    let added;

    // If an array is passed remove all selected
    // expect those yet to be selected
    multiple && this.removeSelected(selected.filter(s => !contains(els, s)));

    els.forEach(el => {
      const model = getModel(el, $);
      if (model && !model.get('selectable')) return;

      // Hanlde multiple selection
      if (ctrlKey && mltSel) {
        return this.toggleSelected(model);
      } else if (shiftKey && mltSel) {
        this.clearSelection(this.get('Canvas').getWindow());
        const coll = model.collection;
        const index = model.index();
        let min, max;

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
  },

  /**
   * Add component to selection
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  addSelected(el, opts = {}) {
    const model = getModel(el, $);
    const models = isArray(model) ? model : [model];

    models.forEach(model => {
      if (model && !model.get('selectable')) return;
      const selected = this.get('selected');
      opts.forceChange && this.removeSelected(model, opts);
      selected.addComponent(model, opts);
    });
  },

  /**
   * Remove component from selection
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  removeSelected(el, opts = {}) {
    this.get('selected').removeComponent(getModel(el, $), opts);
  },

  /**
   * Toggle component selection
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  toggleSelected(el, opts = {}) {
    const model = getModel(el, $);
    const models = isArray(model) ? model : [model];

    models.forEach(model => {
      if (this.get('selected').hasComponent(model)) {
        this.removeSelected(model, opts);
      } else {
        this.addSelected(model, opts);
      }
    });
  },

  /**
   * Hover a component
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  setHovered(el, opts = {}) {
    const model = getModel(el, $);
    if (model && !model.get('hoverable')) return;
    opts.forceChange && this.set('componentHovered', '');
    this.set('componentHovered', model, opts);
  },

  getHovered() {
    return this.get('componentHovered');
  },

  /**
   * Set components inside editor's canvas. This method overrides actual components
   * @param {Object|string} components HTML string or components model
   * @param {Object} opt the options object to be used by the [setComponents]{@link setComponents} method
   * @return {this}
   * @private
   */
  setComponents(components, opt = {}) {
    return this.get('DomComponents').setComponents(components, opt);
  },

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
  },

  /**
   * Set style inside editor's canvas. This method overrides actual style
   * @param {Object|string} style CSS string or style model
   * @param {Object} opt the options object to be used by the `CssRules.add` method
   * @return {this}
   * @private
   */
  setStyle(style, opt = {}) {
    const cssc = this.get('CssComposer');
    cssc.clear(opt);
    cssc.getAll().add(style, opt);
    return this;
  },

  /**
   * Add styles to the editor
   * @param {Array<Object>|Object|string} style CSS string or style model
   * @returns {Array<CssRule>}
   * @private
   */
  addStyle(style, opts = {}) {
    const res = this.getStyle().add(style, opts);
    return isArray(res) ? res : [res];
  },

  /**
   * Returns rules/style model from the editor's canvas
   * @return {Rules}
   * @private
   */
  getStyle() {
    return this.get('CssComposer').getAll();
  },

  /**
   * Change the selector state
   * @param {String} value State value
   * @returns {this}
   */
  setState(value) {
    this.set('state', value);
    return this;
  },

  /**
   * Get the current selector state
   * @returns {String}
   */
  getState() {
    return this.get('state') || '';
  },

  /**
   * Returns HTML built inside canvas
   * @param {Object} [opts={}] Options
   * @returns {string} HTML string
   * @private
   */
  getHtml(opts = {}) {
    const { config } = this;
    const { optsHtml, exportWrapper, wrapperIsBody } = config;
    const js = config.jsInHtml ? this.getJs(opts) : '';
    const cmp = opts.component || this.get('DomComponents').getComponent();
    let html = cmp
      ? this.get('CodeManager').getCode(cmp, 'html', {
          exportWrapper,
          wrapperIsBody,
          ...optsHtml,
          ...opts
        })
      : '';
    html += js ? `<script>${js}</script>` : '';
    return html;
  },

  /**
   * Returns CSS built inside canvas
   * @param {Object} [opts={}] Options
   * @returns {string} CSS string
   * @private
   */
  getCss(opts = {}) {
    const config = this.config;
    const { optsCss, wrapperIsBody } = config;
    const avoidProt = opts.avoidProtected;
    const keepUnusedStyles = !isUndefined(opts.keepUnusedStyles)
      ? opts.keepUnusedStyles
      : config.keepUnusedStyles;
    const cssc = this.get('CssComposer');
    const wrp = opts.component || this.get('DomComponents').getComponent();
    const protCss = !avoidProt ? config.protectedCss : '';
    const css =
      wrp &&
      this.get('CodeManager').getCode(wrp, 'css', {
        cssc,
        wrapperIsBody,
        keepUnusedStyles,
        ...optsCss,
        ...opts
      });
    return wrp ? (opts.json ? css : protCss + css) : '';
  },

  /**
   * Returns JS of all components
   * @return {string} JS string
   * @private
   */
  getJs(opts = {}) {
    var wrp = opts.component || this.get('DomComponents').getWrapper();
    return wrp
      ? this.get('CodeManager')
          .getCode(wrp, 'js')
          .trim()
      : '';
  },

  /**
   * Store data to the current storage
   * @param {Function} clb Callback function
   * @return {Object} Stored data
   * @private
   */
  store(clb) {
    const sm = this.get('StorageManager');
    if (!sm) return;

    const store = this.storeData();
    sm.store(store, res => {
      clb && clb(res, store);
      this.set('changesCount', 0);
      this.trigger('storage:store', store);
    });

    return store;
  },

  storeData() {
    let result = {};
    // Sync content if there is an active RTE
    const editingCmp = this.getEditing();
    editingCmp && editingCmp.trigger('sync:content', { noCount: true });

    this.get('storables').forEach(m => {
      result = { ...result, ...m.store(1) };
    });
    return result;
  },

  /**
   * Load data from the current storage
   * @param {Function} clb Callback function
   * @private
   */
  load(clb = null) {
    this.getCacheLoad(1, res => {
      this.loadData(res);
      clb && clb(res);
    });
  },

  loadData(data = {}) {
    const sm = this.get('StorageManager');
    const result = sm.__clearKeys(data);

    this.get('storables').forEach(module => {
      module.load(result);
      module.postLoad && module.postLoad(this);
    });

    return result;
  },

  /**
   * Returns cached load
   * @param {Boolean} force Force to reload
   * @param {Function} clb Callback function
   * @return {Object}
   * @private
   */
  getCacheLoad(force, clb) {
    if (this.cacheLoad && !force) return this.cacheLoad;
    const sm = this.get('StorageManager');
    const load = [];

    if (!sm) return {};

    this.get('storables').forEach(m => {
      let key = m.storageKey;
      key = isFunction(key) ? key() : key;
      const keys = isArray(key) ? key : [key];
      keys.forEach(k => load.push(k));
    });

    sm.load(load, res => {
      this.cacheLoad = res;
      clb && clb(res);
      setTimeout(() => this.trigger('storage:load', res));
    });
  },

  /**
   * Returns device model by name
   * @return {Device|null}
   * @private
   */
  getDeviceModel() {
    var name = this.get('device');
    return this.get('DeviceManager').get(name);
  },

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
    this.defaultRunning = 1;
  },

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
    this.defaultRunning = 0;
  },

  /**
   * Update canvas dimensions and refresh data useful for tools positioning
   * @private
   */
  refreshCanvas(opts = {}) {
    this.set('canvasOffset', null);
    this.set('canvasOffset', this.get('Canvas').getOffset());
    opts.tools && this.trigger('canvas:updateTools');
  },

  /**
   * Clear all selected stuf inside the window, sometimes is useful to call before
   * doing some dragging opearation
   * @param {Window} win If not passed the current one will be used
   * @private
   */
  clearSelection(win) {
    var w = win || window;
    w.getSelection().removeAllRanges();
  },

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
  },

  /**
   * Return the component wrapper
   * @return {Component}
   */
  getWrapper() {
    return this.get('DomComponents').getWrapper();
  },

  setCurrentFrame(frameView) {
    return this.set('currentFrame', frameView);
  },

  getCurrentFrame() {
    return this.get('currentFrame');
  },

  getCurrentFrameModel() {
    return (this.getCurrentFrame() || {}).model;
  },

  /**
   * Return the count of changes made to the content and not yet stored.
   * This count resets at any `store()`
   * @return {number}
   */
  getDirtyCount() {
    return this.get('changesCount');
  },

  getZoomDecimal() {
    return this.get('Canvas').getZoomDecimal();
  },

  getZoomMultiplier() {
    return this.get('Canvas').getZoomMultiplier();
  },

  setDragMode(value) {
    return this.set('dmode', value);
  },

  t(...args) {
    return this.get('I18n').t(...args);
  },

  /**
   * Returns true if the editor is in absolute mode
   * @returns {Boolean}
   */
  inAbsoluteMode() {
    return this.get('dmode') === 'absolute';
  },

  /**
   * Destroy editor
   */
  destroyAll() {
    const { config, view } = this;
    const editor = this.getEditor();
    const { editors = [] } = config.grapesjs || {};
    this.stopDefault();
    this.get('modules')
      .slice()
      .reverse()
      .forEach(mod => mod.destroy());
    view && view.remove();
    this.stopListening();
    this.clear({ silent: true });
    this.destroyed = 1;
    ['config', 'view', '_previousAttributes', '_events', '_listeners'].forEach(
      i => (this[i] = {})
    );
    editors.splice(editors.indexOf(editor), 1);
    hasWin() &&
      $(config.el)
        .empty()
        .attr(this.attrsOrig);
  },

  getEditing() {
    const res = this.get('editing');
    return (res && res.model) || null;
  },

  setEditing(value) {
    this.set('editing', value);
    return this;
  },

  isEditing() {
    return !!this.get('editing');
  },

  log(msg, opts = {}) {
    const { ns, level = 'debug' } = opts;
    this.trigger('log', msg, opts);
    level && this.trigger(`log:${level}`, msg, opts);

    if (ns) {
      const logNs = `log-${ns}`;
      this.trigger(logNs, msg, opts);
      level && this.trigger(`${logNs}:${level}`, msg, opts);
    }
  },

  logInfo(msg, opts) {
    this.log(msg, { ...opts, level: 'info' });
  },

  logWarning(msg, opts) {
    this.log(msg, { ...opts, level: 'warning' });
  },

  logError(msg, opts) {
    this.log(msg, { ...opts, level: 'error' });
  },

  initBaseColorPicker(el, opts = {}) {
    const config = this.getConfig();
    const { colorPicker = {} } = config;
    const elToAppend = config.el;
    const ppfx = config.stylePrefix;

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
      ...colorPicker
    });
  },

  /**
   * Set/get data from the HTMLElement
   * @param  {HTMLElement} el
   * @param  {string} name Data name
   * @param  {any} value Date value
   * @return {any}
   * @private
   */
  data(el, name, value) {
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
});
