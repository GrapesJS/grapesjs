var deps = ['Utils', 'StorageManager', 'DeviceManager', 'Parser', 'SelectorManager', 'ModalDialog', 'CodeManager', 'Panels',
				'RichTextEditor', 'StyleManager', 'AssetManager', 'CssComposer', 'DomComponents', 'Canvas', 'Commands', 'BlockManager', 'TraitManager'];

// r.js do not see deps if I pass them as a variable
// http://stackoverflow.com/questions/27545412/optimization-fails-when-passing-a-variable-with-a-list-of-dependencies-to-define
define(['backbone', 'backboneUndo', 'keymaster', 'Utils', 'StorageManager', 'DeviceManager', 'Parser', 'SelectorManager',
'ModalDialog', 'CodeManager', 'Panels', 'RichTextEditor', 'StyleManager', 'AssetManager', 'CssComposer', 'DomComponents',
'Canvas', 'Commands', 'BlockManager', 'TraitManager'], function(){
		return Backbone.Model.extend({

			defaults: {
				clipboard: null,
				selectedComponent: null,
				previousModel: null,
				changesCount:	0,
				storables: [],
				toLoad: [],
				opened: {},
				device: '',
			},

			initialize: function(c) {
				this.config = c;
				this.set('Config', c);

				if(c.el && c.fromElement)
					this.config.components = c.el.innerHTML;

				// Load modules
				deps.forEach(function(name){
					this.loadModule(name);
				}, this);

				// Call modules with onLoad callback
				this.get('toLoad').forEach(function(M){
					M.onLoad();
				});

				this.initUndoManager(); // Is already called (inside components and css composer)

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

				return this;
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
					this.store();
					this.set('changesCount', 0);
				}
			},

			/**
			 * Initialize Undo manager
			 * @private
			 * */
			initUndoManager: function() {
				if(this.um)
					return;
				var cmp = this.get('DomComponents');
				if(cmp && this.config.undoManager){
					var that = this;
					this.um = new Backbone.UndoManager({
					    register: [cmp.getComponents(), this.get('CssComposer').getAll()],
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
								beforeCache = model.previousAttributes();
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
							// Update also inputs inside Style Manager
							that.trigger('change:selectedComponent');
						},
						"redo": function (model, bf, af, opt) {
							model.set(af);
							// Update also inputs inside Style Manager
							that.trigger('change:selectedComponent');
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
					this.store();
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
				return this.get('DomComponents').setComponents(components);
			},

			/**
			 * Returns components model from the editor's canvas
			 * @return {Components}
			 * @private
			 */
			getComponents: function(){
				var cmp = this.get('DomComponents');
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
			getStyle: function(){
				return this.get('CssComposer').getAll();
			},

			/**
			 * Returns HTML built inside canvas
			 * @return {string} HTML string
			 * @private
			 */
			getHtml: function(){
				var cmp = this.get('DomComponents');
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
				var cmp = this.get('DomComponents');
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
				var store = {};
				if(!sm)
					return;

				// Fetch what to store
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

				this.get('storables').forEach(function(m){
					var key = m.storageKey;
					key = typeof key === 'function' ? key() : key;
					keys = key instanceof Array ? key : [key];
					keys.forEach(function(k){
						load.push(k);
					});
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
