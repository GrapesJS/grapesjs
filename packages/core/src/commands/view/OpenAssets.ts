import { isFunction } from 'underscore';
import Asset from '../../asset_manager/model/Asset';
import Editor from '../../editor';
import { createEl } from '../../utils/dom';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface OpenAssetsCommandRegistryRun {
  'core:open-assets': CommandPublicFnFromHandler<CommandOpenAssets['run']>;
  'open-assets': CommandPublicFnFromHandler<CommandOpenAssets['run']>;
}

export interface OpenAssetsCommandRegistryStop {
  'core:open-assets': CommandPublicFnFromHandler<CommandOpenAssets['stop']>;
  'open-assets': CommandPublicFnFromHandler<CommandOpenAssets['stop']>;
}

export default class CommandOpenAssets extends CommandAbstract {
  title = '';
  editor?: Editor;
  am?: any;
  rendered?: HTMLElement;

  open(content: string | HTMLElement) {
    const { editor, title, config, am } = this;
    if (!editor || !config || !am) return;
    const { custom } = config;

    if (isFunction(custom.open)) {
      return custom.open(am.__customData());
    }

    const { Modal } = editor;
    Modal.open({ title, content }).onceClose(() => editor.stopCommand(this.id as string));
  }

  close() {
    const { config, am, editor } = this;
    if (!config || !am || !editor) return;
    const { custom } = config;

    if (isFunction(custom.close)) {
      return custom.close(am.__customData());
    }

    const { Modal } = editor;
    Modal && Modal.close();
  }

  run(editor: Editor, sender: any, opts: any = {}) {
    const am = editor.AssetManager;
    const config = am.getConfig();
    const { types = [], accept, select } = opts;
    this.title = opts.modalTitle || editor.t('assetManager.modalTitle') || '';
    this.editor = editor;
    this.config = config;
    this.am = am;

    am.setTarget(opts.target);
    am.onClick(opts.onClick);
    am.onDblClick(opts.onDblClick);
    am.onSelect(opts.onSelect);
    am.__behaviour({
      select,
      types,
      options: opts,
    });

    if (config.custom) {
      this.rendered = this.rendered || createEl('div');
      this.rendered.className = `${config.stylePrefix}custom-wrp`;
      am.__behaviour({ container: this.rendered });
      am.__trgCustom();
    } else {
      if (!this.rendered || types) {
        let assets: Asset[] = am.getAll().filter((i: Asset) => i);

        if (types && types.length) {
          assets = assets.filter((a) => types.indexOf(a.get('type')) !== -1);
        }

        am.render(assets);
        this.rendered = am.getContainer();
      }

      const { rendered } = this;
      if (accept && rendered) {
        const uploadEl = rendered.querySelector(`input#${config.stylePrefix}uploadFile`);
        uploadEl && uploadEl.setAttribute('accept', accept);
      }
    }

    const { rendered } = this;
    rendered && this.open(rendered);
    return this;
  }

  stop(editor: Editor) {
    this.editor = editor;
    this.close();
  }
}
