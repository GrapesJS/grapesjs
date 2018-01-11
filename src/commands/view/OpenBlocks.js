module.exports = {

  run(editor, sender) {
    const bm = editor.BlockManager;
    const pn = editor.Panels;

    if (!this.blocks) {
      bm.render();
      const id = 'views-container';
      const panels = pn.getPanel(id) || pn.addPanel({id});
      const blocks = document.createElement('div');
      const search = document.createElement('input');
      search.className = 'gjs-blocks-search';
      search.placeholder = 'Search..'

      search.addEventListener("keyup", function() {
        const blocks = bm.getAll();
        const value = this.value.toLowerCase();

        if (value) {
          bm.render(blocks.filter(
            block => block.attributes.label.toLowerCase().includes(value)
          ));
        } else {
          bm.render();
        }
      });

      blocks.appendChild(search);
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
