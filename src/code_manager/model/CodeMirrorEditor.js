define(['backbone',
        'text!../../../libs/codemirror/lib/codemirror.css',
        '../../../libs/codemirror/lib/codemirror',
        '../../../libs/codemirror/mode/htmlmixed/htmlmixed',
        '../../../libs/codemirror/mode/css/css', 
        '../../../libs/codemirror/lib/util/formatting'
        ],
	function(Backbone, CodeMirrorStyle, CodeMirror, htmlMode, cssMode, formatting ) {
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
			getId	: function()
			{
				return 'CodeMirror'; 
			},
			
			/** @inheritdoc */
			init: function(el)
			{
				this.editor	= CodeMirror.fromTextArea(el, {
					dragDrop		: false,
					lineNumbers		: this.get('lineNumbers'),
					readOnly		: this.get('readOnly'),
				    mode			: this.get('codeName'),
				    theme			: this.get('theme'),
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