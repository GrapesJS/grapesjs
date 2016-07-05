define([
        'backbone',
        'backboneUndo',
        'keymaster',
        'AssetManager',
        'StorageManager',
        'ModalDialog',
        'CodeManager',
        'CssComposer',
        'Commands',
        'Canvas',
        'RichTextEditor',
        'DomComponents',
        'ClassManager',
        'StyleManager',
        'Panels',
        'Parser',
        'Utils'],
	function(
			Backbone,
			UndoManager,
			Keymaster,
			AssetManager,
			StorageManager,
			ModalDialog,
			CodeManager,
			CssComposer,
			Commands,
			Canvas,
			RichTextEditor,
			DomComponents,
			ClassManager,
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
			},

			initialize: function(c) {
				this.config = c;
				this.pfx = this.config.storagePrefix;
				this.compName	= this.pfx + 'components' + this.config.id;
				this.rulesName	= this.pfx + 'rules' + this.config.id;
				this.set('Config', c);

				if(c.el && c.fromElement)
					this.config.components = c.el.innerHTML;

				this.initParser();
				this.initStorage();
				this.initClassManager();
				this.initModal();
				this.initAssetManager();
				this.initCodeManager();
				this.initCommands();
				this.initPanels();
				this.initRichTextEditor();
				this.initCssComposer();
				this.initComponents();
				this.initCanvas();
				this.initUndoManager();
				this.initUtils();
				this.initStyleManager();

				this.on('change:selectedComponent', this.componentSelected, this);
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
			 * Initialize Parser
			 * @private
			 * */
			initParser: function() {
				this.Parser = new Parser();
				this.set('parser', this.Parser);
			},

			/**
			 * Initialize Utils
			 * @private
			 * */
			initUtils: function() {
				this.Utils = new Utils();
				this.set('Utils', this.Utils);
			},

			/**
			 * Initialize Style Manager
			 * @private
			 * */
			initStyleManager: function(){
				var cfg = this.config.styleManager,
				pfx	= cfg.stylePrefix || 'sm-';
				cfg.pStylePrefix = this.config.stylePrefix;
				cfg.stylePrefix	= this.config.stylePrefix + pfx;
				cfg.target = this;
				this.set('StyleManager', new StyleManager(cfg));
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

				if(this.StorageManager.getConfig().autoload)
					df = this.loadRules();

				if(elStyle)
					cfg.defaults = elStyle;

				if(df)
					cfg.defaults = df;

				cfg.sm = this;
				this.cssc = new CssComposer(cfg);
				this.CssComposer = this.cssc;
				this.set('CssComposer', this.cssc);
				if(this.stm.isAutosave())
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

				if(this.stm.isAutosave() && count < this.stm.getStepsBeforeSave())
					return;

				if(!avSt){
					this.storeRules();
					this.set('changesCount', 0);
				}
			},

			/**
			 * Initialize Class manager
			 * @private
			 * */
			initClassManager: function() {
				var cfg = this.config.classManager,
				pfx	= cfg.stylePrefix || 'clm-';
				cfg.pStylePrefix = this.config.stylePrefix;
				cfg.stylePrefix	= this.config.stylePrefix + pfx;
				cfg.target = this;
				this.clm = new ClassManager(cfg);
				this.ClassManager = this.clm;
				this.set('ClassManager', this.clm);
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

				if(this.StorageManager.getConfig().autoload)
					comp = this.loadComponents();


				cfg.stylePrefix	= this.config.stylePrefix + cmpStylePfx;

				if(comp)
					cfg.components = comp;

				if(this.rte)
					cfg.rte = this.rte;

				if(this.modal)
					cfg.modal = this.modal;

				if(this.am)
					cfg.am = this.am;

				cfg.em = this;

				this.cmp = new DomComponents(cfg);
				this.Components = this.cmp;

				if(this.stm.isAutosave()){
					var md = this.cmp.getComponent();
					this.updateComponents( md, null, { avoidStore : 1 });

					// Call UndoManager here so it's possible to call it also for children inside
					this.initUndoManager();
					this.initChildrenComp(md);
				}

				this.set('Components', this.cmp);
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
			 * Initialize rich text editor
			 * @private
			 * */
			initRichTextEditor: function() {
				var cfg = this.config.rte,
				rteStylePfx	= cfg.stylePrefix || 'rte-';
				cfg.stylePrefix	= this.config.stylePrefix + rteStylePfx;
				this.rte = new RichTextEditor(cfg);
				this.set('RichTextEditor', this.rte);
			},

			/**
			 * Initialize storage
			 * @private
			 * */
			initStorage: function() {
				this.stm = new StorageManager(this.config.storage || this.config.storageManager);
				this.StorageManager = this.stm;
				this.stm.loadDefaultProviders().setCurrent(this.stm.getConfig().type);
				this.set('StorageManager', this.stm);
			},

			/**
			 * Initialize asset manager
			 * @private
			 * */
			initAssetManager: function() {
				var cfg			= this.config.assetManager,
					pfx			= cfg.stylePrefix || 'am-';
				cfg.pStylePrefix = this.config.stylePrefix;
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				if(this.stm)
					cfg.stm = this.stm;

				this.am = new AssetManager(cfg);
				this.AssetManager = this.am;
				this.set('AssetManager', this.am);
			},

			/**
			 * Initialize dialog
			 * @private
			 * */
			initModal: function() {
				var cfg = this.config.modal,
				pfx = cfg.stylePrefix || 'mdl-';
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				this.modal = new ModalDialog(cfg);
				this.modal.render().appendTo('body');
				this.Dialog = this.modal;
				this.set('Modal', this.modal);
			},

			/**
			 * Initialize Code Manager
			 * @private
			 * */
			initCodeManager: function() {
				var cfg = this.config.codeManager,
				pfx = cfg.stylePrefix || 'cm-';
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				this.cm = new CodeManager(cfg);
				this.CodeManager = this.cm;
				this.cm.loadDefaultGenerators().loadDefaultViewers();
				this.set('CodeManager', this.cm);
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
			 * Initialize Panels
			 * @private
			 * */
			initPanels: function() {
				var cfg = this.config.panels,
					pfx = cfg.stylePrefix || 'pn-';
				cfg.pStylePrefix = this.config.stylePrefix;
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				cfg.em = this;
				this.pn = new Panels(cfg);
				//this.pn.addPanel({ id: 'views-container'});
				this.Panels = this.pn;
				this.set('Panels', this.pn);
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
				if(this.stm.isAutosave() && updatedCount < this.stm.getStepsBeforeSave()){
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
					comps = this.Parser.parseCss(result.css);

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
					if(comps.length){
						comps.each(function(md){
								this.updateComponents(md, null, { avoidStore : 1 });
								this.initChildrenComp(md);
								if(this.um)
									this.um.register(md);
						}, this);
					}
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
				var cmp = this.Components;
				var cm = this.CodeManager;

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
				var cmp = this.Components;
				var cm = this.CodeManager;

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
				var cmp = this.Components;
				var cm = this.CodeManager;
				var cssc = this.CssComposer;

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
				var sm = this.StorageManager;

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

				var sm = this.StorageManager;
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

				this.cacheLoad = sm.load(load);

				return this.cacheLoad;
			},

		});
	});
