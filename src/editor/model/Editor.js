var deps = [
require('utils'),
require('storage_manager'),
require('device_manager'),
require('parser'),
require('selector_manager'),
require('modal_dialog'),
require('code_manager'),
require('panels'),
require('rich_text_editor'),
require('style_manager'),
require('asset_manager'),
require('css_composer'),
require('dom_components'),
require('canvas'),
require('commands'),
require('block_manager'),
require('trait_manager'),
];

var Backbone = require('backbone');
var UndoManager = require('backbone-undo');
var key = require('keymaster');
var timedInterval;

if (!Backbone.$) {
  Backbone.$ = $;
}

module.exports = Backbone.Model.extend({

  defaults: {
    clipboard: null,
    designerMode: false,
    selectedComponent: null,
    previousModel: null,
    changesCount: 0,
    storables: [],
    modules: [],
    toLoad: [],
    opened: {},
    device: '',
  },

  initialize(c) {
    this.config = c;
    this.set('Config', c);
    this.set('modules', []);

    if(c.el && c.fromElement)
      this.config.components = c.el.innerHTML;

    // Load modules
    deps.forEach(function(name){
      this.loadModule(name);
    }, this);

    this.initUndoManager();

    this.on('change:selectedComponent', this.componentSelected, this);
    this.on('change:changesCount', this.updateBeforeUnload, this);
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

    // Stuff to do post load (eg. init undo manager for loaded components)
    const postLoad = () => {
      // I've initialized undo manager in initialize() because otherwise the
      // editor will unable to fetch the instance via 'editor.UndoManager' but
      // I need to cleare the stack now as it was dirtied by 'onLoad' method
      this.um.clear();
      this.initUndoManager();
      this.get('modules').forEach(module =>
        module.postLoad && module.postLoad(this)
      );
      clb && clb();
    };

    if (sm && sm.getConfig().autoload) {
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
  updateBeforeUnload() {
    var changes = this.get('changesCount');

    if (this.config.noticeOnUnload && changes) {
      window.onbeforeunload = e => 1;
    } else {
      window.onbeforeunload = null;
    }
  },

  /**
   * Load generic module
   * @param {String} moduleName Module name
   * @return {this}
   * @private
   */
  loadModule(moduleName) {
    var c = this.config;
    var M = new moduleName();
    var name = M.name.charAt(0).toLowerCase() + M.name.slice(1);
    var cfg = c[name] || c[M.name] || {};
    cfg.pStylePrefix = c.pStylePrefix || '';

    // Check if module is storable
    var sm = this.get('StorageManager');
    if(M.storageKey && M.store && M.load && sm){
      cfg.stm = sm;
      var storables = this.get('storables');
      storables.push(M);
      this.set('storables', storables);
    }
    cfg.em = this;
    M.init(Object.create(cfg));

    // Bind the module to the editor model if public
    if(!M.private)
      this.set(M.name, M);

    if(M.onLoad)
      this.get('toLoad').push(M);

    this.get('modules').push(M);
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

  /**
   * Listen for new rules
   * @param {Object} collection
   * @private
   */
  listenRules(collection) {
    this.stopListening(collection, 'add remove', this.listenRule);
    this.listenTo(collection, 'add remove', this.listenRule);
    collection.each(function(model){
      this.listenRule(model);
    }, this);
  },

  /**
   * Listen for rule changes
   * @param {Object} model
   * @private
   */
  listenRule(model) {
    this.stopListening(model, 'change:style', this.handleUpdates);
    this.listenTo(model, 'change:style', this.handleUpdates);
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
      var count = this.get('changesCount') + 1;
      var stm = this.get('StorageManager');
      this.set('changesCount', count);

      if (!stm.isAutosave() || count < stm.getStepsBeforeSave()) {
        return;
      }

      if (!opt.avoidStore) {
        this.store();
      }
    }, 0);
  },

  /**
   * Initialize Undo manager
   * @private
   * */
  initUndoManager() {
    const canvas = this.get('Canvas');

    if (this.um) {
      return;
    }

    var cmp = this.get('DomComponents');
    if(cmp && this.config.undoManager) {
      var that = this;
      this.um = new UndoManager({
          register: [cmp.getComponents(), this.get('CssComposer').getAll()],
          track: true
      });
      this.UndoManager = this.um;
      this.set('UndoManager', this.um);

      key('⌘+z, ctrl+z', () => {
        if (canvas.isInputFocused()) {
          return;
        }

        that.um.undo(true);
        that.trigger('component:update');
      });

      key('⌘+shift+z, ctrl+shift+z', () => {
        if (canvas.isInputFocused()) {
          return;
        }
        that.um.redo(true);
        that.trigger('component:update');
      });

      var beforeCache;
      const customUndoType = {
        on: function (model, value, opts) {
          var opt = opts || {};
          if(!beforeCache){
            beforeCache = model.previousAttributes();
          }
          if (opt && opt.avoidStore) {
            return;
          } else {
            var obj = {
                "object": model,
                "before": beforeCache,
                "after": model.toJSON()
            };
            beforeCache = null;
            return obj;
          }
        },
        undo: function (model, bf, af, opt) {
          model.set(bf);
          // Update also inputs inside Style Manager
          that.trigger('change:selectedComponent');
        },
        redo: function (model, bf, af, opt) {
          model.set(af);
          // Update also inputs inside Style Manager
          that.trigger('change:selectedComponent');
        }
      };

      UndoManager.removeUndoType("change");
      UndoManager.addUndoType("change:style", customUndoType);
      UndoManager.addUndoType("change:content", customUndoType);
    }
  },

  /**
   * Callback on component selection
   * @param   {Object}   Model
   * @param   {Mixed}   New value
   * @param   {Object}   Options
   * @private
   * */
  componentSelected(model, val, options) {
    if (!this.get('selectedComponent')) {
      this.trigger('deselect-comp');
    } else {
      this.trigger('select-comp',[model,val,options]);
      this.trigger('component:selected', arguments);
    }
  },

  /**
   * Triggered when components are updated
   * @param  {Object}  model
   * @param  {Mixed}    val  Value
   * @param  {Object}  opt  Options
   * @private
   * */
  updateComponents(model, val, opt) {
    var comps  = model.get('components'),
        classes  = model.get('classes'),
        avSt  = opt ? opt.avoidStore : 0;

    // Observe component with Undo Manager
    if(this.um)
      this.um.register(comps);

    // Call stopListening for not creating nested listeners
    this.stopListening(comps, 'add', this.updateComponents);
    this.stopListening(comps, 'remove', this.rmComponents);
    this.listenTo(comps, 'add', this.updateComponents);
    this.listenTo(comps, 'remove', this.rmComponents);

    this.stopListening(classes, 'add remove', this.handleUpdates);
    this.listenTo(classes, 'add remove', this.handleUpdates);

    var evn = 'change:style change:content change:attributes';
    this.stopListening(model, evn, this.handleUpdates);
    this.listenTo(model, evn, this.handleUpdates);

    if(!avSt)
      this.handleUpdates(model, val, opt);
  },

  /**
   * Init stuff like storage for already existing elements
   * @param {Object}  model
   * @private
   */
  initChildrenComp(model) {
      var comps  = model.get('components');
      this.updateComponents(model, null, { avoidStore : 1 });
      comps.each(function(md) {
          this.initChildrenComp(md);
          if(this.um)
            this.um.register(md);
      }, this);
  },

  /**
   * Triggered when some component is removed updated
   * @param  {Object}  model
   * @param  {Mixed}    val  Value
   * @param  {Object}  opt  Options
   * @private
   * */
  rmComponents(model, val, opt) {
    var avSt  = opt ? opt.avoidStore : 0;

    if(!avSt)
      this.handleUpdates(model, val, opt);
  },

  /**
   * Returns model of the selected component
   * @return {Component|null}
   * @private
   */
  getSelected() {
    return this.get('selectedComponent');
  },

  /**
   * Select a component
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} opts Options, optional
   * @private
   */
  setSelected(el, opts = {}) {
    let model = el;

    if (el instanceof HTMLElement) {
      model = $(el).data('model');
    }

    this.set('selectedComponent', model, opts);
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

    if(!cmp || !cm)
      return;

    var wrp  = cmp.getComponents();
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
    for(var i = 0, len = rules.length; i < len; i++)
      rules.pop();
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
   * Returns HTML built inside canvas
   * @return {string} HTML string
   * @private
   */
  getHtml() {
    const config = this.config;
    const exportWrapper = config.exportWrapper;
    const wrappesIsBody = config.wrappesIsBody;
    const js = config.jsInHtml ? this.getJs() : '';
    var wrp  = this.get('DomComponents').getComponent();
    var html = this.get('CodeManager').getCode(wrp, 'html', {
      exportWrapper, wrappesIsBody
    });
    html += js ? `<script>${js}</script>` : '';
    return html;
  },

  /**
   * Returns CSS built inside canvas
   * @return {string} CSS string
   * @private
   */
  getCss() {
    const config = this.config;
    const wrappesIsBody = config.wrappesIsBody;
    var cssc = this.get('CssComposer');
    var wrp = this.get('DomComponents').getComponent();
    var protCss = config.protectedCss;

    return protCss + this.get('CodeManager').getCode(wrp, 'css', {
      cssc, wrappesIsBody
    });
  },

  /**
   * Returns JS of all components
   * @return {string} JS string
   * @private
   */
  getJs() {
    var wrp = this.get('DomComponents').getWrapper();
    return this.get('CodeManager').getCode(wrp, 'js').trim();
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
    if(!sm)
      return;

    // Fetch what to store
    this.get('storables').forEach(m => {
      var obj = m.store(1);
      for(var el in obj)
        store[el] = obj[el];
    });

    sm.store(store, () => {
      clb && clb();
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
    this.getCacheLoad(1, (res) => {
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
    var f = force ? 1 : 0;
    if(this.cacheLoad && !f)
      return this.cacheLoad;
    var sm = this.get('StorageManager');
    var load = [];

    if(!sm)
      return {};

    this.get('storables').forEach(m => {
      var key = m.storageKey;
      key = typeof key === 'function' ? key() : key;
      var keys = key instanceof Array ? key : [key];
      keys.forEach(k => {
        load.push(k);
      });
    });

    sm.load(load, res => {
      this.cacheLoad = res;
      clb && clb(res);
      this.trigger('storage:load', res);
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
   * @private
   */
  runDefault() {
    var command = this.get('Commands').get(this.config.defaultCommand);
    if(!command || this.defaultRunning)
      return;
    command.stop(this, this);
    command.run(this, this);
    this.defaultRunning = 1;
  },

  /**
   * Stop default command
   * @private
   */
  stopDefault() {
    var command = this.get('Commands').get(this.config.defaultCommand);
    if(!command)
      return;
    command.stop(this, this);
    this.defaultRunning = 0;
  },

  /**
   * Update canvas dimensions and refresh data useful for tools positioning
   * @private
   */
  refreshCanvas() {
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

});
