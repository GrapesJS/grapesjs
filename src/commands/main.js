/**
 *
 * * [add](#add)
 * * [get](#get)
 *
 * You can init the editor with all necessary commands via configuration
 *
 * ```js
 * var editor = grapesjs.init({
 * 	...
 *  commands: {...} // Check below for the properties
 * 	...
 * });
 * ```
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var commands = editor.Commands;
 * ```
 *
 * @module Commands
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.defaults=[]] Array of possible commands
 * @example
 * ...
 * commands: {
 * 	defaults: [{
 * 		id: 'helloWorld',
 * 		run:  function(editor, sender){
 * 			alert('Hello world!');
 * 		},
 * 		stop:  function(editor, sender){
 * 			alert('Stop!');
 * 		},
 * 	}],
 * },
 * ...
 */
define(function(require) {

	var Commands = function(conf){

		var c = conf || {},
			defaults = require('./config/config'),
			AbsCommands = require('./view/CommandAbstract');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}

		// Need it here as it would be used below
		var add = function(id, obj){
			delete obj.initialize;
			commands[id] = Abstract.extend(obj);
			return this;
		};

		var commands = {};
		var config = c;
		var Abstract = AbsCommands;

		// Load commands passed via configuration
		for( var k in c.defaults){
			var obj = c.defaults[k];
			if(obj.id)
				add(obj.id, obj);
		}

		var defaultCommands = {};
		defaultCommands['select-comp'] = require('./view/SelectComponent');
		defaultCommands['create-comp'] = require('./view/CreateComponent');
		defaultCommands['delete-comp'] = require('./view/DeleteComponent');
		defaultCommands['image-comp'] = require('./view/ImageComponent');
		defaultCommands['move-comp'] = require('./view/MoveComponent');
		defaultCommands['text-comp'] = require('./view/TextComponent');
		defaultCommands['insert-custom'] = require('./view/InsertCustom');
		defaultCommands['export-template'] = require('./view/ExportTemplate');
		defaultCommands['sw-visibility'] = require('./view/SwitchVisibility');
		defaultCommands['open-layers'] = require('./view/OpenLayers');
		defaultCommands['open-sm'] = require('./view/OpenStyleManager');
		defaultCommands['open-blocks'] = require('./view/OpenBlocks');
		//this.defaultCommands['resize-comp'] 	= require('./view/ResizeComponent');

		if(config.em)
			config.model = config.em.get('Canvas');

		return {

			/**
			 * Add new command to the collection
			 * @param	{string} id Command's ID
			 * @param	{Object} command Object representing you command. Methods `run` and `stop` are required
			 * @return {this}
			 * @example
			 * commands.add('myCommand', {
			 * 	run:  function(editor, sender){
			 * 		alert('Hello world!');
			 * 	},
			 * 	stop:  function(editor, sender){
			 * 	},
			 * });
			 * */
			add: add,

			/**
			 * Get command by ID
			 * @param	{string}	id Command's ID
			 * @return {Object} Object representing the command
			 * @example
			 * var myCommand = commands.get('myCommand');
			 * myCommand.run();
			 * */
			get: function(id){
				var el = commands[id];

				if(typeof el == 'function'){
					el = new el(config);
					commands[id]	= el;
				}

				return el;
			},

			/**
			 * Load default commands
			 * @return {this}
			 * @private
			 * */
			loadDefaultCommands: function(){
				for (var id in defaultCommands) {
					this.add(id, defaultCommands[id]);
				}

				return this;
			},
		};

	};

	return Commands;
});