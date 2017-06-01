module.exports = {

  run(editor, sender) {
    this.sender = sender;
    this.wrapper = editor.DomComponents.getWrapper();
    this.components = editor.DomComponents.getComponents();
    this.modal = editor.Modal || null;
    this.cm = editor.CodeManager || null;
    this.cssc = editor.CssComposer || null;
    this.protCss = editor.Config.protectedCss;
    this.pfx = editor.Config.stylePrefix || '';
    this.enable();
  },

  /**
   * Build editor
   * @param  {String}  codeName
   * @param  {String}  theme
   * @param  {String}  label
   *
   * @return  {Object}  Editor
   * @private
   * */
  buildEditor(codeName, theme, label) {
    if(!this.codeMirror)
      this.codeMirror    = this.cm.getViewer('CodeMirror');

    var $input     = $('<textarea>'),

      editor    = this.codeMirror.clone().set({
        label,
        codeName,
        theme,
        input    : $input[0],
      }),

      $editor   = new this.cm.EditorView({
        model    : editor,
        config    : this.cm.getConfig()
      }).render().$el;

    editor.init( $input[0] );

    return { el: editor, $el: $editor };
  },

  enable() {
    if(!this.$editors){
      var oHtmlEd      = this.buildEditor('htmlmixed', 'hopscotch', 'HTML'),
        oCsslEd      = this.buildEditor('css', 'hopscotch', 'CSS');
      this.htmlEditor    = oHtmlEd.el;
      this.cssEditor    = oCsslEd.el;
      this.$editors  = $('<div>', {class: this.pfx + 'export-dl'});
      this.$editors.append(oHtmlEd.$el).append(oCsslEd.$el);
    }

    if(this.modal){
      this.modal.setTitle('Export template');
      this.modal.setContent(this.$editors);
      this.modal.open();
    }
    var addCss = this.protCss || '';
    //this.htmlEditor.setContent(this.cm.getCode(this.components, 'html', this.cssc));
    this.htmlEditor.setContent(this.em.getHtml());
    this.cssEditor.setContent(addCss + this.cm.getCode(this.wrapper, 'css', this.cssc));

    if(this.sender)
      this.sender.set('active',false);
  },

  stop() {}
};
