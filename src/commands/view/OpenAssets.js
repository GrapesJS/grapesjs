const $ = Backbone.$;

module.exports = {
  run(editor, sender, opts = {}) {
    const modal = editor.Modal;
    const am = editor.AssetManager;
    const config = am.getConfig();
    const title = opts.modalTitle || config.modalTitle || '';
    var types = opts.types;
    var accept = opts.accept;

    am.setTarget(opts.target);
    am.onClick(opts.onClick);
    am.onDblClick(opts.onDblClick);
    am.onSelect(opts.onSelect);

    if (!this.rendered || types || accept) {
      var $html;
      var assets;

      if (types) {
        assets = am.getAll().filter(asset => {
          return types.indexOf(asset.get('type')) != -1
        });
      } else {
        assets = am.getAll();
      }

      $html = $(am.render(assets));

      if (accept) $html.find(`input#${config.stylePrefix}uploadFile`).attr('accept', accept);

      this.rendered = 1;
    }

    modal.setTitle(title);
    modal.setContent(am.getContainer());
    modal.open();
  }
};
