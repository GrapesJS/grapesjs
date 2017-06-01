module.exports = {

  run(editor, sender, opts) {
    var opt = opts || {};
    var config = editor.getConfig();
    var modal = editor.Modal;
    var assetManager = editor.AssetManager;

    assetManager.onClick(opt.onClick);
    assetManager.onDblClick(opt.onDblClick);

    // old API
    assetManager.setTarget(opt.target);
    assetManager.onSelect(opt.onSelect);

    modal.setTitle(opt.modalTitle || 'Select image');
    modal.setContent(assetManager.render());
    modal.open();
  },

};
