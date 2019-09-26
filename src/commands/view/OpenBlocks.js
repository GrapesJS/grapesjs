export default {
  run(editor, sender) {
    const bm = editor.BlockManager;
    const pn = editor.Panels;

    if (!this.blocks) {
      bm.render();
      const id = 'views-container';
      const blocks = document.createElement('div');
      const panels = pn.getPanel(id) || pn.addPanel({ id });
      blocks.appendChild(bm.getContainer());
      panels.set('appendContent', blocks).trigger('change:appendContent');
      this.blocks = blocks;
    }

    this.blocks.style.display = 'block';
  },

  stop() {
    const blocks = this.blocks;
    blocks && (blocks.style.display = 'none');
  }
};
