const $ = Backbone.$;

module.exports = {
  run(editor, sender, opts = {}) {
    const modal = editor.Modal;
    const am = editor.AssetManager;
    const config = am.getConfig();
    const title = opts.modalTitle || config.modalTitle || '';
    var types = opts.types;

    am.setTarget(opts.target);
    am.onClick(opts.onClick);
    am.onDblClick(opts.onDblClick);
    am.onSelect(opts.onSelect);

    if (!this.rendered || types) {
      var $html;
      var assets;
      var fileTypes = [];

      if (types) {
        assets = am.getAll().filter(asset => {
          return types.indexOf(asset.get('type')) != -1
        });

        types.forEach((type, i) => {
          fileTypes = fileTypes.concat((am.getType(type).model.prototype.fileTypes || ['*/*']));
        })
      } else {
        assets = am.getAll();
        fileTypes = '*/*';
      }

      $html = $(am.render(assets));
      $html.find(`input#${config.stylePrefix}uploadFile`).attr('accept', $.unique(fileTypes).map((ext, i) => { return ext }).join(','));
      this.rendered = 1;
    }

    modal.setTitle(title);
    modal.setContent(am.getContainer());
    modal.open();
  }
};
