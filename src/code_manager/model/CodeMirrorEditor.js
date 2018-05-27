import Backbone from 'backbone';
var CodeMirror = require('codemirror/lib/codemirror');
var htmlMode = require('codemirror/mode/htmlmixed/htmlmixed');
var cssMode = require('codemirror/mode/css/css');
var formatting = require('codemirror-formatting');

module.exports = Backbone.Model.extend({
  defaults: {
    input: '',
    label: '',
    codeName: '',
    theme: '',
    readOnly: true,
    lineNumbers: true
  },

  /** @inheritdoc */
  init(el) {
    this.editor = CodeMirror.fromTextArea(el, {
      dragDrop: false,
      lineWrapping: true,
      mode: this.get('codeName'),
      ...this.attributes
    });

    return this;
  },

  /** @inheritdoc */
  setContent(v) {
    if (!this.editor) return;
    this.editor.setValue(v);
    if (this.editor.autoFormatRange) {
      CodeMirror.commands.selectAll(this.editor);
      this.editor.autoFormatRange(
        this.editor.getCursor(true),
        this.editor.getCursor(false)
      );
      CodeMirror.commands.goDocStart(this.editor);
    }
  }
});
