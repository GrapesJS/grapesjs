export default {
  run(editor, sender, opts = {}) {
    const modal = editor.Modal;
    const am = editor.AssetManager;
    const config = am.getConfig();
    const title = opts.modalTitle || editor.t('assetManager.modalTitle') || '';
    const types = opts.types;
    const accept = opts.accept;

    am.setTarget(opts.target);
    am.onClick(opts.onClick);
    am.onDblClick(opts.onDblClick);
    am.onSelect(opts.onSelect);

    if (!this.rendered || types) {
      let assets = am.getAll().filter(i => i);

      if (types && types.length) {
        assets = assets.filter(a => types.indexOf(a.get('type')) !== -1);
      }

      am.render(assets);
      this.rendered = am.getContainer();
    }

    if (accept) {
      const uploadEl = this.rendered.querySelector(
        `input#${config.stylePrefix}uploadFile`
      );
      uploadEl && uploadEl.setAttribute('accept', accept);
    }

    modal.open({ title, content: this.rendered });
    return this;
  }
};
