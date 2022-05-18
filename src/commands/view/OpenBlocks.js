import { isFunction } from 'underscore';
import { createEl } from '../../utils/dom';

export default {
  open() {
    const { container, editor, bm, config } = this;
    const { custom, appendTo } = config;

    if (isFunction(custom.open)) {
      return custom.open(bm.__customData());
    }

    if (this.firstRender && !appendTo) {
      const id = 'views-container';
      const pn = editor.Panels;
      const panels = pn.getPanel(id) || pn.addPanel({ id });
      panels.set('appendContent', container).trigger('change:appendContent');
      if (!custom) container.appendChild(bm.render());
    }

    if (container) container.style.display = 'block';
  },

  close() {
    const { container, config } = this;
    const { custom } = config;

    if (isFunction(custom.close)) {
      return custom.close(this.bm.__customData());
    }

    if (container) container.style.display = 'none';
  },

  run(editor) {
    const bm = editor.Blocks;
    this.config = bm.getConfig();
    this.firstRender = !this.container;
    this.container = this.container || createEl('div');
    this.editor = editor;
    this.bm = bm;
    const { container } = this;
    bm.__behaviour({
      container,
    });

    if (this.config.custom) {
      bm.__trgCustom();
    }

    this.open();
  },

  stop() {
    this.close();
  },
};
