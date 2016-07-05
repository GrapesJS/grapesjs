/**
 *
 * * [getConfig](#getconfig)
 * * [getHtml](#gethtml)
 * * [getCss](#getcss)
 * * [getComponents](#getcomponents)
 * * [setComponents](#setcomponents)
 * * [getStyle](#getstyle)
 * * [setStyle](#setstyle)
 * * [getSelected](#getselected)
 * * [runCommand](#runcommand)
 * * [stopCommand](#stopcommand)
 * * [store](#store)
 * * [load](#load)
 * * [render](#render)
 *
 * Editor class contains the top level API which you'll probably use to custom the editor or extend it with plugins.
 * You get the Editor instance on init method
 *
 * ```js
 * var editor = grapesjs.init({...});
 * ```
 *
 * @module Editor
 * @param {Object} config Configurations
 * @param {string} config.container='' Selector for the editor container, eg. '#myEditor'
 * @param {string|Array<Object>} [config.components=''] HTML string or object of components
 * @param {string|Array<Object>} [config.style=''] CSS string or object of rules
 * @param {Boolean} [config.fromElement=false] If true, will fetch HTML and CSS from selected container
 * @param {Boolean} [config.copyPaste=true] Enable/Disable the possibility to copy(ctrl + c) & paste(ctrl + v) components
 * @param {Boolean} [config.undoManager=true] Enable/Disable undo manager
 * @param {Boolean} [config.autorender=true] If true renders editor on init
 * @param {string} [config.height='900px'] Height for the editor container
 * @param {string} [config.width='100%'] Width for the editor container
 * @param {Object} [config.storage={}] Storage manager configuration, see the relative documentation
 * @param {Object} [config.styleManager={}] Style manager configuration, see the relative documentation
 * @param {Object} [config.commands={}] Commands configuration, see the relative documentation
 * @param {Object} [config.domComponents={}] Components configuration, see the relative documentation
 * @param {Object} [config.panels={}] Panels configuration, see the relative documentation
 * @example
 * var editor = grapesjs.init({
 * 	container : '#gjs',
 * 	components: '<div class="txt-red">Hello world!</div>',
 * 	style: '.txt-red{color: red}',
 * });
 */
define(function (require){

		var Editor = function(config) {
			var c = config || {},
			defaults = require('./config/config'),
			EditorModel = require('./model/Editor'),
			EditorView = require('./view/EditorView');

			for (var name in defaults) {
				if (!(name in c))
					c[name] = defaults[name];
			}

			var em = new EditorModel(c);
			var obj = {
					model	: em,
			    config	: c,
			};

		  var editorView = new EditorView(obj);

		  return {

		  	/**
				 * @property {EditorModel}
				 * @private
				 */
		  	editor: em,

		  	/**
				 * @property {DomComponents}
				 */
				DomComponents: em.get('Components'),

				/**
				 * @property {CssComposer}
				 */
				CssComposer: em.get('CssComposer'),

				/**
				 * @property {StorageManager}
				 */
				StorageManager: em.get('StorageManager'),

				/**
				 * @property {AssetManager}
				 */
				AssetManager: em.get('AssetManager'),

				/**
				 * @property {ClassManager}
				 */
				ClassManager: em.get('ClassManager'),

				/**
				 * @property {CodeManager}
				 */
				CodeManager: em.get('CodeManager'),

				/**
				 * @property {Commands}
				 */
				Commands: em.get('Commands'),

				/**
				 * @property {Dialog}
				 */
				Dialog: em.get('Modal'),

				/**
				 * @property {Panels}
				 */
				Panels: em.get('Panels'),

				/**
				 * @property {StyleManager}
				 */
				StyleManager: em.get('StyleManager'),

				/**
				 * @property {Canvas}
				 */
				Canvas: em.get('Canvas'),

				/**
				 * @property {UndoManager}
				 */
				UndoManager: em.get('UndoManager'),

				/**
				 * @property {Utils}
				 */
				Utils: em.get('Utils'),

				/**
				 * @property {Utils}
				 */
				Config: em.get('Config'),

				/**
				 * Initialize editor model
				 * @return {this}
				 * @private
				 */
				init: function(){
					em.init(this);
					return this;
				},

				/**
				 * Returns configuration object
				 * @return {Object}
				 */
				getConfig: function(){
					return c;
				},

				/**
				 * Returns HTML built inside canvas
				 * @return {string} HTML string
				 */
				getHtml: function(){
					return em.getHtml();
				},

				/**
				 * Returns CSS built inside canvas
				 * @return {string} CSS string
				 */
				getCss: function(){
					return em.getCss();
				},

				/**
				 * Returns components in JSON format object
				 * @return {Object}
				 */
				getComponents: function(){
					return em.get('Components').getComponents();
				},

				/**
				 * Set components inside editor's canvas. This method overrides actual components
				 * @param {Array<Object>|Object|string} components HTML string or components model
				 * @return {this}
				 * @example
				 * editor.setComponents('<div class="cls">New component</div>');
				 * // or
				 * editor.setComponents({
				 *  type: 'text',
				 * 	classes:['cls'],
				 * 	content: 'New component'
				 * });
				 */
				setComponents: function(components){
					em.setComponents(components);
					return this;
				},

				/**
				 * Returns style in JSON format object
				 * @return {Object}
				 */
				getStyle: function(){
					return em.get('CssComposer').getRules();
				},

				/**
				 * Set style inside editor's canvas. This method overrides actual style
				 * @param {Array<Object>|Object|string} style CSS string or style model
				 * @return {this}
				 * @example
				 * editor.setStyle('.cls{color: red}');
				 * //or
				 * editor.setStyle({
				 * 	selectors: ['cls']
				 * 	style: { color: 'red' }
				 * });
				 */
				setStyle: function(style){
					em.setStyle(style);
					return this;
				},

				/**
				 * Returns selected component, if there is one
				 * @return {grapesjs.Component}
				 */
				getSelected: function(){
					return em.getSelected();
				},

				/**
				 * Execute command
				 * @param {string} id Command ID
				 * @param {Object} options Custom options
				 * @example
				 * editor.runCommand('myCommand', {someValue: 1});
				 */
				runCommand: function(id, options) {
					var command = em.get('Commands').get(id);

					if(command)
						command.run(this, this, options);
				},

				/**
				 * Stop the command if stop method was provided
				 * @param {string} id Command ID
				 * @param {Object} options Custom options
				 * @example
				 * editor.stopCommand('myCommand', {someValue: 1});
				 */
				stopCommand: function(id, options) {
					var command = em.get('Commands').get(id);

					if(command)
						command.stop(this, this, options);
				},

				/**
				 * Store data to the current storage
				 * @return {Object} Stored data
				 */
				store: function(){
					return em.store();
				},

				/**
				 * Load data from the current storage
				 * @return {Object} Stored data
				 */
				load: function(){
					return em.load();
				},

				/**
				 * Render editor
				 * @return {HTMLElement}
				 */
				render: function() {
					return	editorView.render().el;
				},

			};

		};

		return Editor;
});