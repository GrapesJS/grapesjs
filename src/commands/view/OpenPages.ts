import { CommandObject } from './CommandAbstract';

export default {
  run(editor) {
    const pm = editor.Pages;
    const pn = editor.Panels;
    const lmConfig = pm.getConfig();

    if (lmConfig.appendTo) return;

    if (!this.layers) {
      const id = 'views-container';
      const layers = document.createElement('div');

      const panels = pn.getPanel(id) || pn.addPanel({ id });
      layers.appendChild(pm.render());

      panels.set('appendContent', layers).trigger('change:appendContent');
      this.layers = layers;
    }

    this.layers.style.display = 'block';
  },

  stop() {
    const { layers } = this;
    layers && (layers.style.display = 'none');
  },
} as CommandObject<{}, { [k: string]: any }>;
