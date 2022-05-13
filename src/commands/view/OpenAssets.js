import { isFunction } from 'underscore';
import { createEl } from '../../utils/dom';

export default {
  open(content) {
    const { editor, title, config, am } = this;
    const { custom } = config;
    if (isFunction(custom.open)) {
      return custom.open(am.__customData());
    }
    const { Modal } = editor;
    Modal.open({ title, content }).onceClose(() => editor.stopCommand(this.id));
  },

  close() {
    const { custom } = this.config;
    if (isFunction(custom.close)) {
      return custom.close(this.am.__customData());
    }
    const { Modal } = this.editor;
    Modal && Modal.close();
  },

  run(editor, sender, opts = {}) {
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
        let assets = am.getAll().filter(i => i);

        if (types && types.length) {
          assets = assets.filter(a => types.indexOf(a.get('type')) !== -1);
        }

        am.render(assets);
        this.rendered = am.getContainer();
      }

      if (accept) {
        const uploadEl = this.rendered.querySelector(`input#${config.stylePrefix}uploadFile`);
        uploadEl && uploadEl.setAttribute('accept', accept);
      }
    }

    this.open(this.rendered);
    return this;
  },

  stop(editor) {
    this.editor = editor;
    this.close(this.rendered);
  },
};
