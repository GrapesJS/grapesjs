define(function(require) {
	/**
	 * @class 	CodeManager
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	function CodeManager(config)
	{
		var c			= config || {},
			defaults	= require('./config/config'),
			gInterface	= require('./model/GeneratorInterface'),
			gHtml		= require('./model/HtmlGenerator'),
			gCss		= require('./model/CssGenerator'),
			gJson		= require('./model/JsonGenerator'),
			eInterface	= require('./model/EditorInterface'),
			eCM			= require('./model/CodeMirrorEditor'),
			editorView	= require('./view/EditorView');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}
		
		this.gi					= new gInterface();
		this.generators			= {};
		this.defaultGenerators	= {};
		this.currentGenerator 	= null;
		
		this.ei					= new eInterface();
		this.editors			= {};
		this.defaultEditors		= {};
		this.currentEditor 		= null;
		
		var	geHtml				= new gHtml(),
			geCss				= new gCss(),
			geJson				= new gJson(),
			edCM				= new eCM();
		
		this.defaultGenerators[geHtml.getId()]	= geHtml;
		this.defaultGenerators[geCss.getId()]	= geCss;
		this.defaultGenerators[geJson.getId()]	= geJson;
		
		this.defaultEditors[edCM.getId()]		= edCM;
		
		this.EditorView			= editorView;
		this.config				= c;
	}
	
	CodeManager.prototype	= {
			
			/**
			 * Add new code generator
			 * @param	{GeneratorInterface} generator
			 * 
			 * @return 	this
			 * */
			addGenerator	: function(generator)
			{
				// Check interface implementation
				for (var method in this.gi)
					if(!generator[method]){
						console.warn("addGenerator: method '"+ method +"' was not found");
						return;
					}
				
				var id				= generator.getId();
				this.generators[id] = generator;
				
				if(!this.currentGenerator)
					this.currentGenerator	=	id;
				
				return this;
			},
			
			/**
			 * Returns generator
			 * @param	{String}|{Integer}	id	Generator ID
			 * 
			 * @return 	{GeneratorInterface}|null
			 * */
			getGenerator	: function(id)
			{
				if(id && this.generators[id])
					generator	= this.generators[id];
				
				return generator ? generator : null;
			},
			
			/**
			 * Returns generators
			 * 
			 * @return 	{Array}
			 * */
			getGenerators	: function()
			{
				return this.generators;
			},
			
			/**
			 * Get current generator
			 * 
			 * @return 	{GeneratorInterface}
			 * */
			getCurrentGenerator		: function()
			{
				if(!this.currentGenerator)
					this.loadDefaultGenerators();
				return this.getGenerator(this.currentGenerator);
			},
			
			/**
			 * Set current generator
			 * @param	{Integer}	id	Generator ID
			 * 
			 * @return 	this
			 * */
			setCurrentGenerator		: function(id)
			{
				this.currentGenerator	= id;
				return this;
			},
			
			/**
			 * Load default generators
			 * 
			 * @return 	this
			 * */
			loadDefaultGenerators	: function()
			{
				for (var id in this.defaultGenerators) {
					this.addGenerator(this.defaultGenerators[id]);
				}
				
				return this;
			},
			
			/**
			 * Add new editor
			 * @param	{EditorInterface}	editor
			 * 
			 * @return 	this
			 * */
			addEditor	: function(editor)
			{
				// Check interface implementation
				for (var method in this.ei)
					if(!editor[method]){
						console.warn("addEditor: method '"+ method +"' was not found");
						return;
					}
				
				var id				= editor.getId();
				this.editors[id] 	= editor;
				
				if(!this.currentEditor)
					this.currentEditor	=	id;
				
				return this;
			},
			
			/**
			 * Returns editor
			 * @param	{String}|{Integer}	id	Editor ID
			 * 
			 * @return 	{EditorInterface}|null
			 * */
			getEditor	: function(id)
			{
				if(id && this.editors[id])
					editor	= this.editors[id];
				
				return editor ? editor : null;
			},
			
			/**
			 * Returns editors
			 * 
			 * @return 	{Array}
			 * */
			getEditors	: function()
			{
				return this.editors;
			},
			
			/**
			 * Get current editor
			 * 
			 * @return 	{EditorInterface}
			 * */
			getCurrentEditor		: function()
			{
				if(!this.currentEditor)
					this.loadDefaultEditors();
				return this.getEditor(this.currentEditor);
			},
			
			/**
			 * Set current editor
			 * @param	{Integer}	id	Editor ID
			 * 
			 * @return 	this
			 * */
			setCurrentEditor		: function(id)
			{
				this.currentEditor	= id;
				return this;
			},
			
			/**
			 * Load default editors
			 * 
			 * @return 	this
			 * */
			loadDefaultEditors	: function()
			{
				for (var id in this.defaultEditors) {
					this.addEditor(this.defaultEditors[id]);
				}
				
				return this;
			},
			
			/**
			 * Get code by name
			 * @param	{Backbone.Model}	model	Model
			 * @param	{String}|{Integer}	v		Id of code generator
			 * 
			 * @return	{String}|null
			 * */
			getCode	: function(model, v)
			{
				var id			= v || this.currentGenerator,
					generator	= this.generators[id];
				return generator ? generator.build(model) : null;
			},
			
			/**
			 * Update editor content
			 * @param	{EditorInteface}	editor	Editor
			 * @param	{String}			code	Code value
			 * 
			 * @return	void
			 * */
			updateEditor	: function(editor, code)
			{
				editor.setContent(code);
			},
			
			
	};
	
	return CodeManager;
});