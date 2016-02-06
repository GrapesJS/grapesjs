define(function(require) {
	/**
	 * @class 	Commands
	 * @param 	{Object} Configurations
	 *
	 * @return	{Object}
 	 * */
	function Commands(config)
	{
		var c				= config || {},
			defaults		= require('./config/config'),
			AbsCommands		= require('./view/CommandAbstract');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}

		this.commands		= {};
		this.config			= c;
		this.Abstract		= AbsCommands;

		// Load commands passed by configuration
		for( var k in c.defaults){
			var obj 	= c.defaults[k];
			if(obj.id)
				this.add(obj.id, obj);
		}

		this.defaultCommands					= {};
		this.defaultCommands['select-comp']		= require('./view/SelectComponent');
		this.defaultCommands['create-comp']		= require('./view/CreateComponent');
		this.defaultCommands['delete-comp']		= require('./view/DeleteComponent');
		//this.defaultCommands['resize-comp'] 	= require('./view/ResizeComponent');
		this.defaultCommands['image-comp']		= require('./view/ImageComponent');
		this.defaultCommands['move-comp']		= require('./view/MoveComponent');
		this.defaultCommands['text-comp']		= require('./view/TextComponent');
		this.defaultCommands['insert-custom']	= require('./view/InsertCustom');
		this.defaultCommands['export-template']	= require('./view/ExportTemplate');
		this.defaultCommands['sw-visibility']	= require('./view/SwitchVisibility');
		this.defaultCommands['open-layers']		= require('./view/OpenLayers');
		this.defaultCommands['open-sm']			= require('./view/OpenStyleManager');

		this.config.model 		= this.config.em.get('Canvas');
	}

	Commands.prototype	= {

			/**
			 * Add new command
			 * @param	{String}	id
			 * @param	{Object}	obj
			 *
			 * @return 	this
			 * */
			add	: function(id, obj)
			{
				delete obj.initialize;
				this.commands[id]		= this.Abstract.extend(obj);
				return this;
			},

			/**
			 * Get command
			 * @param	{String}	id
			 *
			 * @return 	Command
			 * */
			get	: function(id)
			{
				var el	= this.commands[id];

				if(typeof el == 'function'){
					el 					= new el(this.config);
					this.commands[id]	= el;
				}

				return el;
			},

			/**
			 * Load default commands
			 *
			 * @return 	this
			 * */
			loadDefaultCommands	: function()
			{
				for (var id in this.defaultCommands) {
					this.add(id, this.defaultCommands[id]);
				}

				return this;
			},
	};

	return Commands;
});