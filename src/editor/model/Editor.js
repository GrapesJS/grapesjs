import {
  isUndefined,
  isFunction,
  isArray,
  contains,
  toArray,
  keys
} from 'underscore';
import Backbone from 'backbone';
import Extender from 'utils/extender';
import { getModel } from 'utils/mixins';

const deps = [
  require('utils'),
  require('i18n'),
  require('keymaps'),
  require('undo_manager'),
  require('storage_manager'),
  require('device_manager'),
  require('parser'),
  require('selector_manager'),
  require('style_manager'),
  require('modal_dialog'),
  require('code_manager'),
  require('panels'),
  require('rich_text_editor'),
  require('asset_manager'),
  require('css_composer'),
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

const $ = Backbone.$;
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
      selected: new Collection(),
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
    this.set('dmode', c.dragMode);
    const el = c.el;
    const log = c.log;
    const toLog = log === true ? keys(logs) : isArray(log) ? log : [];

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
    const cfg = cfgParent || {};
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
  init(editor) {
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
    if (opt.temporary) {
      return;
    }

    timedInterval && clearInterval(timedInterval);
    timedInterval = setTimeout(() => {
      if (!opt.avoidStore) {
        this.set('changesCount', this.get('changesCount') + 1, opt);
      }
    }, 0);
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
    return this.get('selected').last();
  },

  /**
   * Returns an array of all selected components
   * @return {Array}
   * @private
   */
  getSelectedAll() {
    return this.get('selected').models;
  },

  /**
   * Select a component
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  setSelected(el, opts = {}) {
    const multiple = isArray(el);
    const els = multiple ? el : [el];
    const selected = this.get('selected');
    let added;

    // If an array is passed remove all selected
    // expect those yet to be selected
    multiple && this.removeSelected(selected.filter(s => !contains(els, s)));

    els.forEach(el => {
      const model = getModel(el, $);
      if (model && !model.get('selectable')) return;
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
      opts.forceChange && selected.remove(model, opts);
      selected.push(model, opts);
    });
  },

  /**
   * Remove component from selection
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  removeSelected(el, opts = {}) {
    this.get('selected').remove(getModel(el, $), opts);
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
      if (this.get('selected').contains(model)) {
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
   * @return {this}
   * @private
   */
  setComponents(components) {
    return this.get('DomComponents').setComponents(components);
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
   * @return {this}
   * @private
   */
  setStyle(style) {
    var rules = this.get('CssComposer').getAll();
    for (var i = 0, len = rules.length; i < len; i++) rules.pop();
    rules.add(style);
    return this;
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
    return this.get('state');
  },

  /**
   * Returns HTML built inside canvas
   * @return {string} HTML string
   * @private
   */
  getHtml() {
    const config = this.config;
    const exportWrapper = config.exportWrapper;
    const wrapperIsBody = config.wrapperIsBody;
    const js = config.jsInHtml ? this.getJs() : '';
    var wrp = this.get('DomComponents').getComponent();
    var html = this.get('CodeManager').getCode(wrp, 'html', {
      exportWrapper,
      wrapperIsBody
    });
    html += js ? `<script>${js}</script>` : '';
    return html;
  },

  /**
   * Returns CSS built inside canvas
   * @param {Object} [opts={}] Options
   * @return {string} CSS string
   * @private
   */
  getCss(opts = {}) {
    const config = this.config;
    const wrapperIsBody = config.wrapperIsBody;
    const avoidProt = opts.avoidProtected;
    const keepUnusedStyles = !isUndefined(opts.keepUnusedStyles)
      ? opts.keepUnusedStyles
      : config.keepUnusedStyles;
    const cssc = this.get('CssComposer');
    const wrp = this.get('DomComponents').getComponent();
    const protCss = !avoidProt ? config.protectedCss : '';

    return (
      protCss +
      this.get('CodeManager').getCode(wrp, 'css', {
        cssc,
        wrapperIsBody,
        keepUnusedStyles
      })
    );
  },

  /**
   * Returns JS of all components
   * @return {string} JS string
   * @private
   */
  getJs() {
    var wrp = this.get('DomComponents').getWrapper();
    return this.get('CodeManager')
      .getCode(wrp, 'js')
      .trim();
  },

  /**
   * Store data to the current storage
   * @param {Function} clb Callback function
   * @return {Object} Stored data
   * @private
   */
  store(clb) {
    var sm = this.get('StorageManager');
    var store = {};
    if (!sm) return;

    // Fetch what to store
    this.get('storables').forEach(m => {
      var obj = m.store(1);
      for (var el in obj) store[el] = obj[el];
    });

    sm.store(store, res => {
      clb && clb(res);
      this.set('changesCount', 0);
      this.trigger('storage:store', store);
    });

    return store;
  },

  /**
   * Load data from the current storage
   * @param {Function} clb Callback function
   * @private
   */
  load(clb = null) {
    this.getCacheLoad(1, res => {
      this.get('storables').forEach(module => module.load(res));
      clb && clb(res);
    });
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
    var command = this.get('Commands').get(this.config.defaultCommand);
    if (!command) return;
    command.stop(this, this, opts);
    this.defaultRunning = 0;
  },

  /**
   * Update canvas dimensions and refresh data useful for tools positioning
   * @private
   */
  refreshCanvas() {
    this.set('canvasOffset', null);
    this.set('canvasOffset', this.get('Canvas').getOffset());
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
    const {
      DomComponents,
      CssComposer,
      UndoManager,
      Panels,
      Canvas,
      Keymaps,
      RichTextEditor
    } = this.attributes;
    DomComponents.clear();
    CssComposer.clear();
    UndoManager.clear().removeAll();
    Panels.getPanels().reset();
    Canvas.getCanvasView().remove();
    Keymaps.removeAll();
    RichTextEditor.destroy();
    this.view.remove();
    this.stopListening();
    $(this.config.el)
      .empty()
      .attr(this.attrsOrig);
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
