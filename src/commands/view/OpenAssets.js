export default {
  run(editor, sender, opts = {}) {
    const modal = editor.Modal;
    const am = editor.AssetManager;
    const config = am.getConfig();
    const amContainer = am.getContainer();
    var title = opts.modalTitle || config.modalTitle || '';
    /** @var {Localization} **/
    var localization =
      config && config.em && typeof config.em.get === 'function'
        ? em.get('localization')
        : undefined;
    if (typeof localization !== 'undefined') {
      title = localization.get(`assets.modal_title_text`, title);
    }
    const types = opts.types;
    const accept = opts.accept;

    am.setTarget(opts.target);
    am.onClick(opts.onClick);
    am.onDblClick(opts.onDblClick);
    am.onSelect(opts.onSelect);

    if (!this.rendered || types) {
      let assets = am.getAll().filter(i => 1);

      if (types && types.length) {
        assets = assets.filter(a => types.indexOf(a.get('type')) !== -1);
      }

      am.render(assets);
      this.rendered = 1;
    }

    if (accept) {
      const uploadEl = amContainer.querySelector(
        `input#${config.stylePrefix}uploadFile`
      );
      uploadEl && uploadEl.setAttribute('accept', accept);
    }

    modal
      .open({
        title,
        content: amContainer
      })
      .getModel()
      .once('change:open', () => editor.stopCommand(this.id));
    return this;
  },

  stop(editor) {
    editor.Modal.close();
    return this;
  }
};
