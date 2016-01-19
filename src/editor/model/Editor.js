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
			Panels
			){
		return Backbone.Model.extend({
			
			defaults:{
				selectedComponent: 	null,
				changesCount:		0,
			},
			
			initialize: function(c)
			{
				this.config		= c;
				this.compName	= this.config.storagePrefix + 'components' + this.config.id;
				this.set('Config', c);
				
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
			 * Initialize components
			 * */
			initComponents: function()
			{
				var cfg			= this.config.components,
					comp		= this.loadComponentsTree(),
					cmpStylePfx	= cfg.stylePrefix || 'comp-';
				
				cfg.stylePrefix	= this.config.stylePrefix + cmpStylePfx;
				if(comp)
					cfg.wrapper	= comp;
			
				if(this.rte)
					cfg.rte		= this.rte;
			
				if(this.modal)
					cfg.modal	= this.modal;
			
				if(this.am)
					cfg.am		= this.am;
				
				cfg.em			= this;
				
				this.cmp 		= new DomComponents(cfg);
				
				if(this.stm.isAutosave()){ // TODO Currently doesn't listen already created models
					this.updateComponents( this.cmp.getComponent(), null, { avoidStore : 1 });
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
			initUndoManager: function(){
				if(this.cmp && this.config.undoManager){
					var backboneUndo = new Backbone.UndoManager({
					    register: [this.cmp.getComponent().get('components')],
					    track: true
					});
					key('⌘+z, ctrl+z', function(){
						backboneUndo.undo(); 
					});
					key('⌘+shift+z, ctrl+shift+z', function(){
						backboneUndo.redo();
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
			 * */
			componentsUpdated: function()
			{
				var updatedCount = this.get('changesCount') + 1;
				this.set('changesCount', updatedCount);
				if(this.stm.isAutosave() && updatedCount < this.stm.getChangesBeforeSave()){
					return;
				}
				this.storeComponentsTree();
				this.set('changesCount', 0 );
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
			loadComponentsTree: function(){
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
			storeComponentsTree: function(){
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
					avSt	= opt ? opt.avoidStore : 0;

				// Call stopListening for not creating nested listenings 
				this.stopListening(comps, 'add', this.updateComponents);
				this.stopListening(comps, 'remove', this.rmComponents);
				this.listenTo(comps, 'add', this.updateComponents);
				this.listenTo(comps, 'remove', this.rmComponents);
				
				this.stopListening(model, 'change:style change:content', this.updateComponents);
				this.listenTo(model, 'change:style change:content', this.updateComponents);
				
				if(!avSt)
					this.componentsUpdated();
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
