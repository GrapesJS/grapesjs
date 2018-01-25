const Layers = require('navigator');
const $ = Backbone.$;

module.exports = {
  run(em, sender) {
    if (!this.toAppend) {
      let collection = em.DomComponents.getComponent().get('components');
      let config = em.getConfig();
      let pfx = config.stylePrefix;
      let panels = em.Panels;
      let lyStylePfx = config.layers.stylePrefix || 'nv-';

      config.layers.stylePrefix = config.stylePrefix + lyStylePfx;
      config.layers.pStylePrefix = config.stylePrefix;
      config.layers.em = em.editor;
      config.layers.opened = em.editor.get('opened');

      // Check if panel exists otherwise crate it
      if (!panels.getPanel('views-container'))
        this.panel = panels.addPanel({ id: 'views-container' });
      else this.panel = panels.getPanel('views-container');

      const toAppend = $(`<div class="${pfx}layers"></div>`);
      this.panel.set('appendContent', toAppend).trigger('change:appendContent');
      config.layers.sortContainer = toAppend.get(0);
      const layers = new Layers().init(collection, config.layers);
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
