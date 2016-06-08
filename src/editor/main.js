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

		  var DomComponents = editorModel.get('Components');
		  var CssComposer = editorModel.get('CssComposer');

		  return {

		  	editor: editorModel,

				DomComponents: DomComponents,

				/**
				 * @property {CssComposer}
				 * @type {[type]}
				 */
				CssComposer: CssComposer,

				/**
				 * Returns HTML built inside canvas
				 * @return {string} HTML string
				 */
				getHtml: function(){
					editorModel.getHtml();
				},

				/**
				 * Returns CSS built inside canvas
				 * @return {string} CSS string
				 */
				getCss: function(){
					editorModel.getCss();
				},

				/**
				 * Returns components in JSON format object
				 * @return {Object}
				 */
				getComponents: function(){
					return editorModel.get('Components').getComponents();
				},

				/**
				 * Returns style in JSON format object
				 * @return {Object}
				 */
				getStyle: function(){
					return editorModel.get('CssComposer').getRules();
				},

				render: function() {
					return	editorView.render().$el;
				},

			};

		};

		return Editor;
});