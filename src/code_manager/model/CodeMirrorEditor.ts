import { bindAll } from 'underscore';
import { Model } from '../../common';
import { EditorState, Extension, Compartment } from '@codemirror/state';
import { EditorViewConfig } from '@codemirror/view';
import readOnlyRangesExtension from 'codemirror-readonly-ranges';
import { EditorView, basicSetup } from 'codemirror';
import { LanguageSupport, syntaxHighlighting } from '@codemirror/language';
import { oneDarkTheme, oneDarkHighlightStyle } from '@codemirror/theme-one-dark';
import { autoFormaAll } from '@qwex/codemirror-beautify';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';

export default class CodeMirrorEditor extends Model {
  editor?: EditorView;
  element?: HTMLElement;
  private readOnlyCompartment = new Compartment();

  defaults() {
    return {
      input: '',
      label: '',
      codeName: '',
      theme: 'hopscotch',
      readOnly: true,
      lineNumbers: true,
      autoFormat: true,
      readOnlyRanges: (targetState: EditorState) => {
        return [] as Array<{ from: number | undefined; to: number | undefined }>;
      },
    };
  }

  get readonly(): boolean {
    return this.get('readOnly');
  }

  get readOnlyRanges() {
    return this.get('readOnlyRanges');
  }

  private editorFromTextArea(textarea: HTMLTextAreaElement, config: EditorViewConfig) {
    let view = new EditorView({ doc: textarea.value, ...config });
    textarea.parentNode?.insertBefore(view.dom, textarea);
    textarea.style.display = 'none';
    if (textarea.form)
      textarea.form.addEventListener('submit', () => {
        textarea.value = view.state.doc.toString();
      });
    return view;
  }

  private getCodeLanguage(name: string) {
    switch (name) {
      case 'htmlmixed':
        return html();
      case 'css':
        return css();
      case 'js':
        return javascript();
      default:
        return undefined;
    }
  }

  private setReadonlyState(readOnly: boolean) {
    const { editor, readOnlyCompartment } = this;
    if (editor) {
      const readonlyState = editor.state.update({
        effects: [readOnlyCompartment.reconfigure(EditorState.readOnly.of(readOnly))],
      });
      editor.update([readonlyState]);
    }
  }

  init(el: HTMLTextAreaElement) {
    bindAll(this, 'onChange');
    const languageState = this.getCodeLanguage(this.get('codeName'));

    let extensions: Extension[] = [];
    extensions.push(basicSetup);
    extensions.push(oneDarkTheme);
    extensions.push(syntaxHighlighting(oneDarkHighlightStyle));
    languageState && extensions.push(languageState);
    extensions.push(this.readOnlyCompartment.of(EditorState.readOnly.of(this.readonly)));
    extensions.push(readOnlyRangesExtension(this.readOnlyRanges));
    const state = EditorState.create({
      doc: el.value,
      extensions,
    });

    this.editor = this.editorFromTextArea(el, {
      state,
      ...this.attributes,
    });
    this.element = el;
    this.editor.dom.addEventListener('change', this.onChange);

    return this;
  }

  onChange() {
    this.trigger('update', this);
  }

  getEditor() {
    return this.editor!;
  }

  /**
   * The element where the viewer is attached
   * @return {HTMLElement}
   */
  getElement() {
    return this.element;
  }

  /**
   * Set the element which contains the viewer attached.
   * Generally, it should be just a textarea, but some editor might require
   * a container for it some in that case this method can be used
   * @param {HTMLElement} el
   * @return {self}
   */
  setElement(el: HTMLElement) {
    this.element = el;
    return this;
  }

  /**
   * Focus the viewer
   * @return {self}
   */
  focus() {
    this.getEditor().focus();
    return this;
  }

  getContent() {
    const ed = this.getEditor();
    return ed && ed.state.doc;
  }

  /** @inheritdoc */
  setContent(value: string, opts: any = {}) {
    const { readonly } = this;
    if (this.editor) {
      this.setReadonlyState(false);
      const state = this.editor.state;
      const update = state.update({ changes: { from: 0, to: state.doc.length, insert: value } });
      this.editor.update([update]);
      const autoFormat = this.get('autoFormat');
      const canAutoFormat =
        autoFormat === true || (Array.isArray(autoFormat) && autoFormat.includes(this.get('codeName')));

      if (canAutoFormat) {
        autoFormaAll(this.editor);
      }
      this.setReadonlyState(readonly);
    }
  }
}

// @ts-ignore
CodeMirrorEditor.prototype.CodeMirror = EditorView;
