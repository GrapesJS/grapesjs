import Editor, { EditorParam } from '../../editor';
import { createEl } from '../../utils/dom';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface ExportTemplateRunOptions {
  optsHtml?: EditorParam<'getHtml', 0>;
  optsCss?: EditorParam<'getCss', 0>;
}

export interface ExportTemplateCommandRegistryRun {
  'core:open-code': CommandPublicFnFromHandler<CommandExportTemplate['run']>;
  'export-template': CommandPublicFnFromHandler<CommandExportTemplate['run']>;
}

export interface ExportTemplateCommandRegistryStop {
  'core:open-code': CommandPublicFnFromHandler<CommandExportTemplate['stop']>;
  'export-template': CommandPublicFnFromHandler<CommandExportTemplate['stop']>;
}

export default class CommandExportTemplate extends CommandAbstract<
  ExportTemplateRunOptions,
  ExportTemplateRunOptions,
  void,
  void
> {
  cm: Editor['CodeManager'] | null = null;
  editors?: HTMLElement;
  htmlEditor?: { setContent: (content: string) => void };
  cssEditor?: { setContent: (content?: string) => void };

  run(editor: Editor, sender: any, opts: ExportTemplateRunOptions = {}) {
    sender && sender.set && sender.set('active', 0);
    const config = editor.getConfig();
    const modal = editor.Modal;
    const pfx = config.stylePrefix;
    this.cm = editor.CodeManager || null;

    if (!this.editors) {
      const oHtmlEd = this.buildEditor('htmlmixed', 'hopscotch', 'HTML');
      const oCsslEd = this.buildEditor('css', 'hopscotch', 'CSS');
      this.htmlEditor = oHtmlEd.model;
      this.cssEditor = oCsslEd.model;
      const editors = createEl('div', { class: `${pfx}export-dl` });
      editors.appendChild(oHtmlEd.el);
      editors.appendChild(oCsslEd.el);
      this.editors = editors;
    }

    modal
      .open({
        title: config.textViewCode,
        content: this.editors,
      })
      .getModel()
      .once('change:open', () => editor.stopCommand(`${this.id}`));
    this.htmlEditor?.setContent(editor.getHtml(opts.optsHtml));
    this.cssEditor?.setContent(editor.getCss(opts.optsCss));
  }

  stop(editor: Editor) {
    const modal = editor.Modal;
    modal && modal.close();
  }

  buildEditor(codeName: string, theme: string, label: string) {
    const cm = this.em.CodeManager;
    const model = cm.createViewer({
      label,
      codeName,
      theme,
    });

    const el = new cm.EditorView({
      model,
      config: cm.getConfig(),
    } as any).render().el;

    return { model, el };
  }
}
