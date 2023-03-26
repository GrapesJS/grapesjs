import { CommandObject } from './CommandAbstract';
import { EditorParam } from '../../editor';
import { $ } from '../../common';

interface ExportTemplateRunOptions {
  optsHtml?: EditorParam<'getHtml', 0>;
  optsCss?: EditorParam<'getCss', 0>;
}

export default {
  run(editor, sender, opts: ExportTemplateRunOptions = {}) {
    sender && sender.set && sender.set('active', 0);
    const config = editor.getConfig();
    const modal = editor.Modal;
    const pfx = config.stylePrefix;
    this.cm = editor.CodeManager || null;

    if (!this.$editors) {
      const oHtmlEd = this.buildEditor('htmlmixed', 'hopscotch', 'HTML');
      const oCsslEd = this.buildEditor('css', 'hopscotch', 'CSS');
      this.htmlEditor = oHtmlEd.el;
      this.cssEditor = oCsslEd.el;
      const $editors = $(`<div class="${pfx}export-dl"></div>`);
      $editors.append(oHtmlEd.$el).append(oCsslEd.$el);
      this.$editors = $editors;
    }

    modal
      .open({
        title: config.textViewCode,
        content: this.$editors,
      })
      .getModel()
      .once('change:open', () => editor.stopCommand(`${this.id}`));
    this.htmlEditor.setContent(editor.getHtml(opts.optsHtml));
    this.cssEditor.setContent(editor.getCss(opts.optsCss));
  },

  stop(editor) {
    const modal = editor.Modal;
    modal && modal.close();
  },

  buildEditor(codeName: string, theme: string, label: string) {
    const input = document.createElement('textarea');
    !this.codeMirror && (this.codeMirror = this.cm.getViewer('CodeMirror'));

    const el = this.codeMirror.clone().set({
      label,
      codeName,
      theme,
      input,
    });

    const $el = new this.cm.EditorView({
      model: el,
      config: this.cm.getConfig(),
    }).render().$el;

    el.init(input);

    return { el, $el };
  },
} as CommandObject<{}, { [k: string]: any }>;
