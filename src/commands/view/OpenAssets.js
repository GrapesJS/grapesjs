define(function() {
	return {

		run: function(editor, sender, opts) {
			var opt = opts || {};
			var config = editor.getConfig();
			var modal = editor.Modal;
			var assetManager = editor.AssetManager;
			assetManager.onClick(opt.onClick);
			assetManager.onDblClick(opt.onDblClick);

			// old API
			assetManager.setTarget(opt.target);
			assetManager.onSelect(opt.onSelect);

			if (modal) {
				modal.setTitle(opt.modalTitle || 'Select image');
				modal.setContent('');
				modal.setContent(assetManager.render(1));
				modal.open();
			}
		},

	};
});
