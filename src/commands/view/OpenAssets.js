module.exports = {

  run(editor, sender, opts = {}) {
    const modal = editor.Modal;
    const am = editor.AssetManager;
    const config = am.getConfig();
    const title = opts.modalTitle || config.modalTitle || '';

    am.setTarget(opts.target);
    am.onClick(opts.onClick);
    am.onDblClick(opts.onDblClick);
    am.onSelect(opts.onSelect);

    if (!this.rendered) {
      console.log('render now');
      am.render();
      this.rendered = 1;
    }

    modal.setTitle(title);
    modal.setContent(am.getContainer());
    modal.open();
  },

};
