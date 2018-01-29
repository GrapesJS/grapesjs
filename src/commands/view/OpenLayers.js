const Layers = require('navigator');
const $ = Backbone.$;

module.exports = {
  run(em, sender) {
    if (!this.toAppend) {
      var collection = em.DomComponents.getComponent().get('components');
      var config = em.getConfig();
      var pfx = config.stylePrefix;
      var panels = em.Panels;
      const cLayers = { ...config.layers };
      var lyStylePfx = cLayers.stylePrefix || 'nv-';

      cLayers.stylePrefix = config.stylePrefix + lyStylePfx;
      cLayers.pStylePrefix = config.stylePrefix;
      cLayers.em = em.editor;
      cLayers.opened = em.editor.get('opened');

      // Check if panel exists otherwise crate it
      if (!panels.getPanel('views-container'))
        this.panel = panels.addPanel({ id: 'views-container' });
      else this.panel = panels.getPanel('views-container');

      const toAppend = $(`<div class="${pfx}layers"></div>`);
      this.panel.set('appendContent', toAppend).trigger('change:appendContent');
      cLayers.sortContainer = toAppend.get(0);
      const layers = new Layers().init(collection, cLayers);
      this.$layers = layers.render();
      toAppend.append(this.$layers);
      this.toAppend = toAppend;
    }
    this.toAppend.show();
  },

  stop() {
    this.toAppend && this.toAppend.hide();
  }
};
