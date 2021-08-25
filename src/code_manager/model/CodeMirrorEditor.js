import { bindAll } from 'underscore';
import Backbone from 'backbone';
import { hasWin } from 'utils/mixins';

let CodeMirror;

if (hasWin()) {
  CodeMirror = require('codemirror/lib/codemirror');
  require('codemirror/mode/htmlmixed/htmlmixed');
  require('codemirror/mode/css/css');
  require('codemirror-formatting');
}

export default Backbone.Model.extend({
  CodeMirror,

  defaults: {
    input: '',
    label: '',
    codeName: '',
    theme: 'hopscotch',
    readOnly: true,
    lineNumbers: true
  },

  /** @inheritdoc */
  init(el) {
    bindAll(this, 'onChange');
    this.editor = CodeMirror.fromTextArea(el, {
      dragDrop: false,
      lineWrapping: true,
      mode: this.get('codeName'),
      ...this.attributes
    });
    this.element = el;
    this.editor.on('change', this.onChange);

    return this;
  },

  onChange() {
    this.trigger('update', this);
  },

  getEditor() {
    return this.editor;
  },

  /**
   * The element where the viewer is attached
   * @return {HTMLElement}
   */
  getElement() {
    return this.element;
  },

  /**
   * Set the element which contains the viewer attached.
   * Generally, it should be just a textarea, but some editor might require
   * a container for it some in that case this method can be used
   * @param {HTMLElement} el
   * @return {self}
   */
  setElement(el) {
    this.element = el;
    return this;
  },

  /**
   * Refresh the viewer
   * @return {self}
   */
  refresh() {
    this.getEditor().refresh();
    return this;
  },

  /**
   * Focus the viewer
   * @return {self}
   */
  focus() {
    this.getEditor().focus();
    return this;
  },

  getContent() {
    const ed = this.getEditor();
    return ed && ed.getValue();
  },

  /** @inheritdoc */
  setContent(v, opts = {}) {
    const { editor } = this;
    if (!editor) return;
    editor.setValue(v);

    if (editor.autoFormatRange) {
      CodeMirror.commands.selectAll(editor);
      editor.autoFormatRange(editor.getCursor(true), editor.getCursor(false));
      CodeMirror.commands.goDocStart(editor);
    }

    !opts.noRefresh && setTimeout(() => this.refresh());
  }
});
