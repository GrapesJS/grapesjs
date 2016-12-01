define(['backbone',
        'codemirror/lib/codemirror',
        'codemirror/mode/htmlmixed/htmlmixed',
        'codemirror/mode/css/css',
        'formatting'
        ],
	function(Backbone, CodeMirror, htmlMode, cssMode, formatting) {
		/**
		 * @class CodeViewer
		 * */
		return Backbone.Model.extend({

			defaults: {
				input		: '',
				label		: '',
				codeName 	: '',
				theme		: '',
				readOnly 	: true,
				lineNumbers	: true,
			},

			/** @inheritdoc */
			init: function(el)
			{
				this.editor	= CodeMirror.fromTextArea(el, {
					dragDrop: false,
          lineWrapping: true,
					lineNumbers: this.get('lineNumbers'),
					readOnly: this.get('readOnly'),
				  mode: this.get('codeName'),
				  theme: this.get('theme'),
				});

				return this;
			},

			/** @inheritdoc */
			setContent	: function(v)
			{
				if(!this.editor)
					return;
				this.editor.setValue(v);
				if(this.editor.autoFormatRange){
					CodeMirror.commands.selectAll(this.editor);
					this.editor.autoFormatRange(this.editor.getCursor(true), this.editor.getCursor(false) );
					CodeMirror.commands.goDocStart(this.editor);
				}
			},

        });
	});
