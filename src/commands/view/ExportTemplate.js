define(function() {
		/**
		 * @class ExportTemplate
		 * @private
		 * */
		return {

			run: function(em, sender){
				this.sender		= sender;
				this.components = em.get('Canvas').getWrapper().get('components');
				this.modal		= em.get('Modal') || null;
				this.cm			= em.get('CodeManager') || null;
				this.cssc = em.get('CssComposer') || null;
				this.enable();
			},

			/**
			 * Build editor
			 * @param	{String}	codeName
			 * @param	{String}	theme
			 * @param	{String}	label
			 *
			 * @return	{Object}	Editor
			 * @private
			 * */
			buildEditor: function(codeName, theme, label)
			{
				if(!this.codeMirror)
					this.codeMirror		= this.cm.getEditor('CodeMirror');

				var $input 		= $('<textarea>'),

					editor		= this.codeMirror.clone().set({
						label		: label,
						codeName	: codeName,
						theme		: theme,
						input		: $input[0],
					}),

					$editor 	= new this.cm.EditorView({
						model		: editor,
						config		: this.cm.config
					}).render().$el;

				editor.init( $input[0] );

				return { el: editor, $el: $editor };
			},

			enable: function()
			{
				if(!this.$editors){
					var oHtmlEd			= this.buildEditor('htmlmixed', 'hopscotch', 'HTML'),
						oCsslEd			= this.buildEditor('css', 'hopscotch', 'CSS');
					this.htmlEditor		= oHtmlEd.el;
					this.cssEditor		= oCsslEd.el;
					this.$editors		= $('<div>');
					this.$editors.append(oHtmlEd.$el).append(oCsslEd.$el);
				}

				if(this.modal){
					this.modal.setTitle('Export template');
					this.modal.setContent(this.$editors);
					this.modal.show();
				}

				this.htmlEditor.setContent( this.cm.getCode(this.components, 'html') );
				this.cssEditor.setContent( this.cm.getCode(this.components, 'css', this.cssc));

				if(this.sender)
					this.sender.set('active',false);
			},

			stop: function(){}
		};
	});