export default {
  run(editor) {
    const lm = editor.LayerManager;
    const pn = editor.Panels;
    const lmConfig = lm.getConfig();

    if (lmConfig.appendTo) return;

    if (!this.layers) {
      const id = 'views-container';
      const layers = document.createElement('div');
      const panels = pn.getPanel(id) || pn.addPanel({ id });

      if (lmConfig.custom) {
        lm.__trgCustom({ container: layers });
      } else {
        layers.appendChild(lm.render());
      }

      panels.set('appendContent', layers).trigger('change:appendContent');
      this.layers = layers;
    }

    this.layers.style.display = 'block';
  },

  stop() {
    const { layers } = this;
    layers && (layers.style.display = 'none');
  },
};
