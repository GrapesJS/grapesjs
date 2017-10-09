const $ = Backbone.$;

module.exports = {

  run(editor, sender) {
    var config = editor.Config;
    var pfx = config.stylePrefix;
    var bm = editor.BlockManager;
    var panelC;
    if (!this.blocks) {
      this.blocks = $('<div></div>').get(0);
      bm.render();
      this.blocks.appendChild(bm.getContainer());
      var panels = editor.Panels;
      if(!panels.getPanel('views-container'))
        panelC = panels.addPanel({id: 'views-container'});
      else
        panelC = panels.getPanel('views-container');
      panelC.set('appendContent', this.blocks).trigger('change:appendContent');
    }

    this.blocks.style.display = 'block';
  },

  stop() {
    if(this.blocks)
      this.blocks.style.display = 'none';
  }
};
