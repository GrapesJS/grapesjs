define([
        'backbone',
        'backboneUndo',
        'keymaster',
        'AssetManager',
        'StorageManager',
        'ModalDialog',
        'CodeManager',
        'Commands',
        'Canvas',
        'RichTextEditor',
        'DomComponents',
        'ClassManager',
        'Panels'],
	function(
			Backbone,
			UndoManager,
			Keymaster,
			AssetManager,
			StorageManager,
			ModalDialog,
			CodeManager,
			Commands,
			Canvas,
			RichTextEditor,
			DomComponents,
			ClassManager,
			Panels
			){
		return Backbone.Model.extend({

			defaults:{
				clipboard					: null,
				selectedComponent	: null,
				previousModel 		: null,
				changesCount			:	0,
			},

			initialize: function(c)
			{
				this.config		= c;
				this.compName	= this.config.storagePrefix + 'components' + this.config.id;
				this.set('Config', c);

				this.initClassManager();
				this.initStorage();
				this.initModal();
				this.initAssetManager();
				this.initCodeManager();
				this.initCommands();
				this.initPanels();
				this.initRichTextEditor();
				this.initComponents();
				this.initCanvas();
				this.initUndoManager();

				this.on('change:selectedComponent', this.componentSelected, this);
			},

			/**
			 * Initialize Class manager
			 * */
			initClassManager: function()
			{
				var cfg = this.config.classManager,
						pfx	= cfg.stylePrefix || 'clm-';
				cfg.stylePrefix	= this.config.stylePrefix + pfx;
				cfg.target = this;
				this.clm = new ClassManager(cfg);
				this.set('ClassManager', this.clm);
			},

			/**
			 * Initialize components
			 * */
			initComponents: function()
			{
				var cfg				= this.config.components,
					comp				= this.loadComponents(),
					cmpStylePfx	= cfg.stylePrefix || 'comp-';

				cfg.stylePrefix	= this.config.stylePrefix + cmpStylePfx;

				if(comp)
					cfg.wrapper	= comp;

				if(this.rte)
					cfg.rte			= this.rte;

				if(this.modal)
					cfg.modal		= this.modal;

				if(this.am)
					cfg.am			= this.am;

				cfg.em				= this;

				this.cmp 			= new DomComponents(cfg);

				if(this.stm.isAutosave()){
					var md 	= this.cmp.getComponent();
					this.updateComponents( md, null, { avoidStore : 1 });

					// Call UndoManager here so it's possible to call it also for children inside
					this.initUndoManager();
					this.initChildrenComp(md);
				}

				this.set('Components', this.cmp);
			},

			/**
			 * Initialize canvas
			 * */
			initCanvas: function()
			{
				var cfg				= this.config.canvas,
					pfx				= cfg.stylePrefix || 'cv-';
					cfg.stylePrefix	= this.config.stylePrefix + pfx;
				cfg.canvasId	= this.config.idCanvas;
				this.cv			= new Canvas(this.config.canvas);

				if(this.cmp)
					this.cv.setWrapper(this.cmp);

				this.set('Canvas', this.cv);
			},

			/**
			 * Initialize rich text editor
			 * */
			initRichTextEditor: function()
			{
				var cfg			= this.config.rte,
					rteStylePfx	= cfg.stylePrefix || 'rte-';
				cfg.stylePrefix	= this.config.stylePrefix + rteStylePfx;
				this.rte		= new RichTextEditor(cfg);
				this.set('RichTextEditor', this.rte);
			},

			/**
			 * Initialize storage
			 * */
			initStorage: function()
			{
				this.stm		= new StorageManager(this.config.storageManager);
				this.stm.loadDefaultProviders().setCurrentProvider(this.config.storageType);
				this.set('StorageManager', this.stm);
			},

			/**
			 * Initialize asset manager
			 * */
			initAssetManager: function()
			{
				var cfg			= this.config.assetManager,
					pfx			= cfg.stylePrefix || 'am-';
				cfg.stylePrefix = this.config.stylePrefix + pfx;

				if(this.stm)
					cfg.stm = this.stm;

				this.am			= new AssetManager(cfg);
				this.set('AssetManager', this.am);
			},

			/**
			 * Initialize modal
			 * */
			initModal: function()
			{
				var cfg			= this.config.modal,
					pfx			= cfg.stylePrefix || 'mdl-';
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				this.modal		= new ModalDialog(cfg);
				this.modal.render().appendTo('body');
				this.set('Modal', this.modal);
			},

			/**
			 * Initialize Code Manager
			 * */
			initCodeManager: function()
			{
				var cfg			= this.config.codeManager,
					pfx			= cfg.stylePrefix || 'cm-';
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				this.cm		= new CodeManager(cfg);
				this.cm.loadDefaultGenerators().loadDefaultEditors();
				this.set('CodeManager', this.cm);
			},

			/**
			 * Initialize Commands
			 * */
			initCommands: function()
			{
				var cfg			= this.config.commands,
					pfx			= cfg.stylePrefix || 'com-';
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				cfg.em			= this;
				cfg.canvasId	= this.config.idCanvas;
				cfg.wrapperId	= this.config.idWrapper;
				this.com		= new Commands(cfg);
				this.com.loadDefaultCommands();
				this.set('Commands', this.com);
			},

			/**
			 * Initialize Panels
			 * */
			initPanels: function()
			{
				var cfg			= this.config.panels,
					pfx			= cfg.stylePrefix || 'pn-';
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				cfg.em			= this;
				this.pn			= new Panels(cfg);
				this.pn.addPanel({ id: 'views-container'});
				this.set('Panels', this.pn);
			},

			/**
			 * Initialize Undo manager
			 * */
			initUndoManager: function()
			{
				if(this.um)
					return;
				if(this.cmp && this.config.undoManager){
					var that 	= this;
					this.um 	= new Backbone.UndoManager({
					    register: [this.cmp.getComponent().get('components')],
					    track: true
					});
					this.set('UndoManager', this.um);
					key('⌘+z, ctrl+z', function(){
						that.um.undo();
					});
					key('⌘+shift+z, ctrl+shift+z', function(){
						that.um.redo();
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

					//TODO when, for example, undo delete cant redelete it, so need to
					//recall 'remove command'
				}
			},

			/**
			 * Triggered when components are updated
			 * @param	{Object}	model
			 * @param	{Mixed}		val	Value
			 * @param	{Object}	opt	Options
			 * */
			componentsUpdated: function(model, val, opt)
			{
				var updatedCount = this.get('changesCount') + 1,
						avSt	= opt ? opt.avoidStore : 0;
				this.set('changesCount', updatedCount);
				if(this.stm.isAutosave() && updatedCount < this.stm.getChangesBeforeSave()){
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
			 *
			 * */
			componentSelected: function(model, val, options)
			{
				if(!this.get('selectedComponent'))
					this.trigger('deselect-comp');
				else
					this.trigger('select-comp',[model,val,options]);
			},

			/**
			 * Load components from storage
			 *
			 * @return	{Object}
			 * */
			loadComponents: function(){
				var result = null;
				try{
					result	=  JSON.parse(this.stm.load(this.compName));
				}catch(err){
					console.warn("Error encountered while parsing JSON response");
				}
				return result;
			},

			/**
			 * Save components to storage
			 *
			 * @return void
			 * */
			storeComponents: function(){
				var wrp	= this.cmp.getComponent();
				if(wrp && this.cm){
					var res	= this.cm.getCode(wrp, 'json');
					this.stm.store(this.compName, JSON.stringify(res));
				}
			},

			/**
			 * Triggered when components are updated
			 * @param	{Object}	model
			 * @param	{Mixed}		val	Value
			 * @param	{Object}	opt	Options
			 *
			 * */
			updateComponents: function(model, val, opt){
				var comps	= model.get('components'),
						classes	= model.get('classes'),
						avSt	= opt ? opt.avoidStore : 0;

				// Observe component with Undo Manager
				if(this.um)
					this.um.register(comps);

				// Call stopListening for not creating nested listenings
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
			 */
			initChildrenComp: function(model)
			{
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
			 *
			 * */
			rmComponents: function(model, val, opt){
				var avSt	= opt ? opt.avoidStore : 0;

				if(!avSt)
					this.componentsUpdated();
			}

		});
	});
