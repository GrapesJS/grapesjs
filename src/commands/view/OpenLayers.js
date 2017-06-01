var Layers = require('navigator');

module.exports = {

  run(em, sender) {
    if(!this.$layers) {
      var collection = em.DomComponents.getComponent().get('components'),
      config = em.getConfig(),
      panels = em.Panels,
      lyStylePfx = config.layers.stylePrefix || 'nv-';

      config.layers.stylePrefix = config.stylePrefix + lyStylePfx;
      config.layers.pStylePrefix = config.stylePrefix;
      config.layers.em 	= em.editor;
      config.layers.opened = em.editor.get('opened');
      var layers = new Layers(collection, config.layers);
      this.$layers = layers.render();

      // Check if panel exists otherwise crate it
      if(!panels.getPanel('views-container'))
        this.panel = panels.addPanel({id: 'views-container'});
      else
        this.panel = panels.getPanel('views-container');

      this.panel.set('appendContent', this.$layers).trigger('change:appendContent');
    }
    this.$layers.show();
  },

  stop() {
    if(this.$layers)
      this.$layers.hide();
  }
};
