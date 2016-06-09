define(function (require){
		/**
		 * @class 	Grapes
		 * @param 	{Object} Configurations
		 *
		 * @return	{Object}
	 	 * */
		var Editor = function(config) {
			var c = config || {},
			defaults = require('./config/config'),
			Editor = require('./model/Editor'),
			EditorView = require('./view/EditorView');

			for (var name in defaults) {
				if (!(name in c))
					c[name] = defaults[name];
			}

			var editorModel = new Editor(c);
			var obj = {
					model	: editorModel,
			    config	: c,
			};

		  var editorView = new EditorView(obj);

		  return {

		  	editor: editorModel,

		  	/**
				 * @property {DomComponents}
				 */
				DomComponents: editorModel.get('Components'),

				/**
				 * @property {CssComposer}
				 */
				CssComposer: editorModel.get('CssComposer'),

				/**
				 * @property {StorageManager}
				 */
				StorageManager: editorModel.get('StorageManager'),

				/**
				 * @property {AssetManager}
				 */
				AssetManager: editorModel.get('AssetManager'),

				/**
				 * @property {ClassManager}
				 */
				ClassManager: editorModel.get('ClassManager'),

				/**
				 * @property {CodeManager}
				 */
				CodeManager: editorModel.get('CodeManager'),

				/**
				 * @property {Commands}
				 */
				Commands: editorModel.get('Commands'),

				/**
				 * @property {Dialog}
				 */
				Dialog: editorModel.get('Modal'),

				/**
				 * @property {Panels}
				 */
				Panels: editorModel.get('Panels'),

				/**
				 * @property {StyleManager}
				 */
				StyleManager: editorModel.get('StyleManager'),

				/**
				 * @property {StyleManager}
				 */
				Canvas: editorModel.get('Canvas'),

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
					return editorModel.getHtml();
				},

				/**
				 * Returns CSS built inside canvas
				 * @return {string} CSS string
				 */
				getCss: function(){
					return editorModel.getCss();
				},

				/**
				 * Returns components in JSON format object
				 * @return {Object}
				 */
				getComponents: function(){
					return editorModel.get('Components').getComponents();
				},

				/**
				 * Set components inside editor's canvas. This method overrides actual components
				 * @param {Array<Object>|Object|string} components HTML string or components model
				 * @return {this}
				 */
				setComponents: function(components){
					editorModel.setComponents(components);
					return this;
				},

				/**
				 * Returns style in JSON format object
				 * @return {Object}
				 */
				getStyle: function(){
					return editorModel.get('CssComposer').getRules();
				},

				/**
				 * Set style inside editor's canvas. This method overrides actual style
				 * @param {Array<Object>|Object|string} style CSS string or style model
				 * @return {this}
				 */
				setStyle: function(style){
					editorModel.setStyle(style);
					return this;
				},

				/**
				 * Returns selected component, if there is one
				 * @return {grapesjs.Component}
				 */
				getSelected: function(){
					return editorModel.getSelected();
				},

				/**
				 * Store data to the current storage
				 * @return {Object} Stored data
				 */
				store: function(){
					return editorModel.store();
				},

				/**
				 * Store data to the current storage
				 * @return {Object} Stored data
				 */
				load: function(){
					return editorModel.load();
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