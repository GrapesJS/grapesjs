define(function (require){
		/**
		 * @class 	Grapes
		 * @param 	{Object} Configurations
		 *
		 * @return	{Object}
	 	 * */
		var Grapes	= function(config)
		{
			var c			= config || {},
			defaults		= require('./config/config'),
			Editor			= require('./model/Editor'),
			EditorView		= require('./view/EditorView');

			for (var name in defaults) {
				if (!(name in c))
					c[name] = defaults[name];
			}

			this.editor		= new Editor(c);
			var obj				= {
					model	: this.editor,
			    	config	: c,
			};

		  this.editorView = new EditorView(obj);
		};

		Grapes.prototype	= {

			render		: function()
			{
				return	this.editorView.render().$el;
			}

		};

		return Grapes;
});