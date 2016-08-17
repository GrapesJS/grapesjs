var deps = ['backbone', 'backboneUndo', 'keymaster', 'Utils', 'StorageManager', 'DeviceManager', 'Parser', 'SelectorManager',
					'ModalDialog', 'AssetManager', 'CodeManager', 'Panels', 'RichTextEditor', 'StyleManager',
        'BlockManager',
        'CssComposer',
        'Commands',
        'Canvas',
        'DomComponents'];
define([
        'backbone',
        'backboneUndo',
        'keymaster',
        'AssetManager',
        'BlockManager',
        'StorageManager',
        'DeviceManager',
        'ModalDialog',
        'CodeManager',
        'CssComposer',
        'Commands',
        'Canvas',
        'RichTextEditor',
        'DomComponents',
        'SelectorManager',
        'StyleManager',
        'Panels',
        'Parser',
        'Utils'],
	function(
			Backbone,
			UndoManager,
			Keymaster,
			AssetManager,
			BlockManager,
			StorageManager,
			DeviceManager,
			ModalDialog,
			CodeManager,
			CssComposer,
			Commands,
			Canvas,
			RichTextEditor,
			DomComponents,
			SelectorManager,
			StyleManager,
			Panels,
			Parser,
			Utils
			){
		return Backbone.Model.extend({

			defaults: {
				clipboard: null,
				selectedComponent: null,
				previousModel: null,
				changesCount:	0,
				storables: [],
				device: '',
			},

			initialize: function(c) {
				this.config = c;
				this.pfx = this.config.storagePrefix;
				this.compName	= this.pfx + 'components' + this.config.id;
				this.rulesName	= this.pfx + 'rules' + this.config.id;
				this.set('Config', c);

				if(c.el && c.fromElement)
					this.config.components = c.el.innerHTML;

				this.loadModule('Utils'); // no dep
				this.loadModule('StorageManager'); // No dep
				this.loadModule('DeviceManager'); // No dep
				this.loadModule('Parser'); // No dep
				this.loadModule('SelectorManager'); // No dep
				this.loadModule('ModalDialog'); // No dep
				this.loadModule('AssetManager'); // requires SelectorManager
				this.loadModule('CodeManager'); // no deps
				this.loadModule('Panels'); // no deps
				this.loadModule('RichTextEditor'); // no deps
				this.loadModule('StyleManager'); // no deps
				this.initCommands();
				this.initCssComposer();
				this.initComponents(); // Requires AssetManager and Dialog for images components
				this.initCanvas(); // Requires RTE and Components
				this.initUndoManager();
				this.loadModule('BlockManager'); // Requires utils, canvas

				this.on('change:selectedComponent', this.componentSelected, this);
			},

			/**
			 * Load generic module
			 * @param {String} moduleName Module name
			 * @return {this}
			 */
			loadModule: function(moduleName) {
				var c = this.config;
				var M = new require(moduleName)();
				var name = M.name.charAt(0).toLowerCase() + M.name.slice(1);
				var cfg = c[name] || c[M.name] || {};
				cfg.pStylePrefix = c.stylePrefix;

				// Check if module is storable
				var sm = this.get('StorageManager');
				if(M.storageKey && M.store && M.load && sm){
					cfg.stm = sm;
					var storables = this.get('storables');
					storables.push(M);
					this.set('storables', storables);
				}
				cfg.em = this;
				M.init(cfg);

				if(M.onLoad)
					M.onLoad();

				// Bind the module to the editor model if public
				if(M.public)
					this.set(M.name, M);
				return this;
			},

			/**
			 * Initialize Commands
			 * @private
			 * */
			initCommands: function() {
				var cfg = this.config.commands,
					pfx = cfg.stylePrefix || 'com-';
				cfg.pStylePrefix = this.config.stylePrefix;
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				cfg.em = this;
				cfg.canvasId = this.config.idCanvas;
				cfg.wrapperId = this.config.idWrapper;
				this.com = new Commands(cfg);
				this.Commands = this.com;
				this.com.loadDefaultCommands();
				this.set('Commands', this.com);
			},

			/**
			 * Initialize canvas
			 * @private
			 * */
			initCanvas: function() {
				var cfg = this.config.canvas,
				pfx = cfg.stylePrefix || 'cv-';
				cfg.pStylePrefix	= this.config.stylePrefix;
				cfg.stylePrefix	= this.config.stylePrefix + pfx;
				cfg.canvasId	= this.config.idCanvas;
				cfg.em = this;
				this.cv = new Canvas(cfg);

				if(this.cmp)
					this.cv.setWrapper(this.cmp);
				this.Canvas = this.cv;
				this.set('Canvas', this.cv);
			},

			/**
			 * Initialize editor model and set editor instance
			 * @param {Editor} editor Editor instance
			 * @return {this}
			 * @private
			 */
			init: function(editor){
				this.set('Editor', editor);
			},

			/**
			 * Initialize Css Composer
			 * @private
			 * */
			initCssComposer: function() {
				var elStyle = this.config.style || '';
				var cfg = _.clone(this.config.cssComposer),
				df = '';
				pfx	= cfg.stylePrefix || 'css-';
				cfg.stylePrefix	= this.config.stylePrefix + pfx;

				if(this.get('StorageManager').getConfig().autoload)
					df = this.loadRules();

				if(elStyle)
					cfg.defaults = elStyle;

				if(df)
					cfg.defaults = df;

				cfg.sm = this;
				this.cssc = new CssComposer(cfg);
				this.CssComposer = this.cssc;
				this.set('CssComposer', this.cssc);
				if(this.get('StorageManager').isAutosave())
					this.listenRules(this.cssc.getRules());
			},

			/**
			 * Listen for new rules
			 * @param {Object} collection
			 * @private
			 */
			listenRules: function(collection) {
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
			listenRule: function(model) {
				this.stopListening(model, 'change:style', this.ruleUpdated);
				this.listenTo(model, 'change:style', this.ruleUpdated);
			},

			/**
			 * Triggered when rule is updated
			 * @param	{Object}	model
			 * @param	{Mixed}		val	Value
			 * @param	{Object}	opt	Options
			 * @private
			 * */
			ruleUpdated: function(model, val, opt) {
				var count = this.get('changesCount') + 1,
						avSt	= opt ? opt.avoidStore : 0;
				this.set('changesCount', count);
        var stm = this.get('StorageManager');
				if(stm.isAutosave() && count < stm.getStepsBeforeSave())
					return;

				if(!avSt){
					this.storeRules();
					this.set('changesCount', 0);
				}
			},

			/**
			 * Initialize components
			 * @private
			 * */
			initComponents: function() {
				this.config.domComponents.components = this.config.components;
				var cfg = this.config.domComponents,
				comp = '',
				cmpStylePfx	= cfg.stylePrefix || 'comp-';

				if(this.get('StorageManager').getConfig().autoload)
					comp = this.loadComponents();

				cfg.pStylePrefix	= this.config.stylePrefix;
				cfg.stylePrefix	= this.config.stylePrefix + cmpStylePfx;

				if(comp)
					cfg.components = comp;

				cfg.rte = this.get('rte') || '';

				cfg.modal = this.get('Modal') || '';

				cfg.am = this.get('AssetManager') || '';

				cfg.em = this;

				this.cmp = new DomComponents(cfg);
				this.Components = this.cmp;

				if(this.get('StorageManager').isAutosave()){
					// Call UndoManager here so it's possible to call it also for children inside
					this.initUndoManager();
					this.initChildrenComp(this.cmp.getWrapper());
				}

				this.set('Components', this.cmp);
			},

			/**
			 * Initialize Undo manager
			 * @private
			 * */
			initUndoManager: function() {
				if(this.um)
					return;
				if(this.cmp && this.config.undoManager){
					var that = this;
					this.um = new Backbone.UndoManager({
					    register: [this.cmp.getComponents(), this.cssc.getRules()],
					    track: true
					});
					this.UndoManager = this.um;
					this.set('UndoManager', this.um);
					key('⌘+z, ctrl+z', function(){
						that.um.undo(true);
					});
					key('⌘+shift+z, ctrl+shift+z', function(){
						that.um.redo(true);
					});

					Backbone.UndoManager.removeUndoType("change");
					var beforeCache;
					Backbone.UndoManager.addUndoType("change:style", {
						"on": function (model, value, opt) {
							if(!beforeCache)
								beforeCache = model.toJSON();
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
						"undo": function (model, bf, af, opt) {
							model.set(bf);
						},
						"redo": function (model, bf, af, opt) {
							model.set(af);
						}
					});
				}
			},

			/**
			 * Triggered when components are updated
			 * @param	{Object}	model
			 * @param	{Mixed}		val	Value
			 * @param	{Object}	opt	Options
			 * @private
			 * */
			componentsUpdated: function(model, val, opt){
				var updatedCount = this.get('changesCount') + 1,
						avSt	= opt ? opt.avoidStore : 0;
				this.set('changesCount', updatedCount);
				var stm = this.get('StorageManager');
				if(stm.isAutosave() && updatedCount < stm.getStepsBeforeSave()){
					return;
				}

				if(!avSt){
					this.storeComponents();
					this.set('changesCount', 0);
				}
			},

			/**
			 * Callback on component selection
			 * @param 	{Object} 	Model
			 * @param 	{Mixed} 	New value
			 * @param 	{Object} 	Options
			 * @private
			 * */
			componentSelected: function(model, val, options){
				if(!this.get('selectedComponent'))
					this.trigger('deselect-comp');
				else
					this.trigger('select-comp',[model,val,options]);
			},

			/**
			 * Load components from storage
			 * @return	{Object}
			 * @private
			 * */
			loadComponents: function() {
				var comps = '';
				var result = this.getCacheLoad();

				if(result.components){
					try{
						comps	=  JSON.parse(result.components);
					}catch(err){}
				}else if(result.html)
					comps = result.html;

				return comps;
			},

			/**
			 * Save components to storage
			 * @private
			 * */
			storeComponents: function() {
				this.store();
			},

			/**
			 * Load rules from storage
			 * @return {Array<Object>}
			 * @private
			 * */
			loadRules: function() {
				var comps = '';
				var result = this.getCacheLoad();

				if(result.style){
					try{
						comps	=  JSON.parse(result.style);
					}catch(err){}
				}else if(result.css)
					comps = this.get('Parser').parseCss(result.css);

				return comps;
			},

			/**
			 * Save rules to storage
			 * @private
			 * */
			storeRules: function() {
				this.store();
			},

			/**
			 * Triggered when components are updated
			 * @param	{Object}	model
			 * @param	{Mixed}		val	Value
			 * @param	{Object}	opt	Options
			 * @private
			 * */
			updateComponents: function(model, val, opt) {
				var comps	= model.get('components'),
						classes	= model.get('classes'),
						avSt	= opt ? opt.avoidStore : 0;

				// Observe component with Undo Manager
				if(this.um)
					this.um.register(comps);

				// Call stopListening for not creating nested listeners
				this.stopListening(comps, 'add', this.updateComponents);
				this.stopListening(comps, 'remove', this.rmComponents);
				this.listenTo(comps, 'add', this.updateComponents);
				this.listenTo(comps, 'remove', this.rmComponents);

				this.stopListening(classes, 'add remove', this.componentsUpdated);
				this.listenTo(classes, 'add remove', this.componentsUpdated);

				var evn = 'change:style change:content';
				this.stopListening(model, evn, this.componentsUpdated);
				this.listenTo(model, evn, this.componentsUpdated);

				if(!avSt)
					this.componentsUpdated();
			},

			/**
			 * Init stuff like storage for already existing elements
			 * @param {Object}	model
			 * @private
			 */
			initChildrenComp: function(model) {
					var comps	= model.get('components');
					this.updateComponents(model, null, { avoidStore : 1 });
					comps.each(function(md){
							this.initChildrenComp(md);
							if(this.um)
								this.um.register(md);
					}, this);
			},

			/**
			 * Triggered when some component is removed updated
			 * @param	{Object}	model
			 * @param	{Mixed}		val	Value
			 * @param	{Object}	opt	Options
			 * @private
			 * */
			rmComponents: function(model, val, opt){
				var avSt	= opt ? opt.avoidStore : 0;

				if(!avSt)
					this.componentsUpdated();
			},

			/**
			 * Returns model of the selected component
			 * @return {Component|null}
			 * @private
			 */
			getSelected: function(){
				return this.get('selectedComponent');
			},

			/**
			 * Set components inside editor's canvas. This method overrides actual components
			 * @param {Object|string} components HTML string or components model
			 * @return {this}
			 * @private
			 */
			setComponents: function(components){
				return this.Components.setComponents(components);
			},

			/**
			 * Returns components model from the editor's canvas
			 * @return {Components}
			 * @private
			 */
			getComponents: function(){
				var cmp = this.get('Components');
				var cm = this.get('CodeManager');

				if(!cmp || !cm)
					return;

				var wrp	= cmp.getComponent();
				return cm.getCode(wrp, 'json');
			},

			/**
			 * Set style inside editor's canvas. This method overrides actual style
			 * @param {Object|string} style CSS string or style model
			 * @return {this}
			 * @private
			 */
			setStyle: function(style){
				var rules = this.CssComposer.getRules();
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
			getStyle: function(){
				return this.CssComposer.getRules();
			},

			/**
			 * Returns HTML built inside canvas
			 * @return {string} HTML string
			 * @private
			 */
			getHtml: function(){
				var cmp = this.get('Components');
				var cm = this.get('CodeManager');

				if(!cmp || !cm)
					return;

				var wrp	= cmp.getComponent();
				return cm.getCode(wrp, 'html');
			},

			/**
			 * Returns CSS built inside canvas
			 * @return {string} CSS string
			 * @private
			 */
			getCss: function(){
				var cmp = this.get('Components');
				var cm = this.get('CodeManager');
				var cssc = this.get('CssComposer');

				if(!cmp || !cm || !cssc)
					return;

				var wrp	= cmp.getComponent();
				return cm.getCode(wrp, 'css', cssc);
			},

			/**
			 * Store data to the current storage
			 * @return {Object} Stored data
			 * @private
			 */
			store: function(){
				var sm = this.get('StorageManager');

				if(!sm)
					return;

				var smc = sm.getConfig();
				var store = {};

				if(smc.storeHtml)
					store.html = this.getHtml();

				if(smc.storeComponents)
					store.components = JSON.stringify(this.getComponents());

				if(smc.storeCss)
					store.css = this.getCss();

				if(smc.storeStyles)
					store.styles = JSON.stringify(this.getStyle());

				this.get('storables').forEach(function(m){
					var obj = m.store(1);
					for(var el in obj)
						store[el] = obj[el];
				});

				sm.store(store);
				return store;
			},

			/**
			 * Load data from the current storage
			 * @return {Object} Loaded data
			 * @private
			 */
			load: function(){
				var result = this.getCacheLoad(1);
				this.get('storables').forEach(function(m){
					m.load(result);
				});
				//this.setComponents(result.components || result.html);
				//this.setStyle(result.styles || result.css);
				return result;
			},

			/**
			 * Returns cached load
			 * @param {Boolean} force Force to reload
			 * @return {Object}
			 * @private
			 */
			getCacheLoad: function(force){
				var f = force ? 1 : 0;

				if(this.cacheLoad && !f)
					return this.cacheLoad;

				var sm = this.get('StorageManager');
				var load = [];

				if(!sm)
					return {};

				var smc = sm.getConfig();

				if(smc.storeHtml)
					load.push('html');

				if(smc.storeComponents)
					load.push('components');

				if(smc.storeCss)
					load.push('css');

				if(smc.storeStyles)
					load.push('styles');

				this.get('storables').forEach(function(m){
					load.push(m.storageKey);
				});

				this.cacheLoad = sm.load(load);

				return this.cacheLoad;
			},

			/**
			 * Returns device model by name
			 * @return {Device|null}
			 */
			getDeviceModel: function(){
				var name = this.get('device');
				return this.get('DeviceManager').get(name);
			},

			/**
			 * Run default command if setted
			 * @private
			 */
			runDefault: function(){
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
			stopDefault: function(){
				var command = this.get('Commands').get(this.config.defaultCommand);
				if(!command)
					return;
				command.stop(this, this);
				this.defaultRunning = 0;
			},

		});
	});
