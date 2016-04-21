/**
 * This module manages commands which could be called mainly by buttons.
 * You can init the editor with all necessary commands via configuration
 *
 * ```js
 * var editor = new GrapesJS({
 * 	...
 *  commands: {...} // Check below for the properties
 * 	...
 * });
 * ```
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var commandsService = editor.get('Commands');
 * ```
 *
 * @module Commands
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.defaults=[]] Array of possible commands
 * @param {Boolean} [config.firstCentered=true] If true will center new first-level components
 * @param {number} [config.minComponentH=50] Minimum height (in px) for new inserted components
 * @param {number} [config.minComponentW=50] Minimum width (in px) for new inserted components
 * @example
 * ...
 * commands: {
 *  firstCentered: true,
 *  minComponentH: 100,
 *  minComponentW: 100,
 * 	defaults: [{
 * 		id: 'helloWorld',
 * 		run:  function(serviceManager, senderBtn){
 * 			alert('Hello world!');
 * 		},
 * 		stop:  function(serviceManager, senderBtn){
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
		//this.defaultCommands['resize-comp'] 	= require('./view/ResizeComponent');
		config.model = config.em.get('Canvas');

		return {

			/**
			 * Add new command to the collection
			 * @param	{string} id Command's ID
			 * @param	{Object} command Object representing you command. Methods `run` and `stop` are required
			 * @return {this}
			 * @example
			 * commandsService.add('myCommand', {
			 * 	run:  function(serviceManager, senderBtn){
			 * 		alert('Hello world!');
			 * 	},
			 * 	stop:  function(serviceManager, senderBtn){
			 * 	},
			 * });
			 * */
			add: add,

			/**
			 * Get command by ID
			 * @param	{string}	id Command's ID
			 * @return {Object} Object representing the command
			 * @example
			 * var myCommand = commandsService.get('myCommand');
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