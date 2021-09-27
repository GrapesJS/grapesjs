import { createEl } from '../../utils/dom';

export default {
  open() {
    const { container, editor, bm } = this;

    if (this.firstRender) {
      const id = 'views-container';
      const pn = editor.Panels;
      const panels = pn.getPanel(id) || pn.addPanel({ id });
      panels.set('appendContent', container).trigger('change:appendContent');
      if (!bm.getConfig().custom) container.appendChild(bm.render());
    }

    if (container) container.style.display = 'block';
  },

  close() {
    const { container } = this;
    if (container) container.style.display = 'none';
  },

  run(editor, sender) {
    const bm = editor.Blocks;
    this.firstRender = !this.container;
    this.container = this.container || createEl('div');
    this.editor = editor;
    this.bm = bm;
    const { container } = this;
    bm.__behaviour({
      container
    });

    if (bm.getConfig().custom) {
      bm.__trgCustom();
    }

    this.open();
  },

  stop() {
    this.close();
  }
};
