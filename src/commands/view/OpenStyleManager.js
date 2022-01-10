import Backbone from 'backbone';
const $ = Backbone.$;

export default {
  run(editor, sender) {
    this.sender = sender;

    if (!this.$cn) {
      const config = editor.getConfig();
      const panels = editor.Panels;
      const trgEvCnt = 'change:appendContent';
      this.$cn = $('<div></div>');
      this.$cn2 = $('<div></div>');
      this.$cn.append(this.$cn2);

      // Device Manager
      const dvm = editor.DeviceManager;
      if (dvm && config.showDevices) {
        const devicePanel = panels.addPanel({ id: 'devices-c' });
        const dvEl = dvm.render();
        devicePanel.set('appendContent', dvEl).trigger(trgEvCnt);
      }

      // Selector Manager container
      const slm = editor.SelectorManager;
      this.slm = slm;
      const slmConfig = slm.getConfig();
      if (slmConfig.custom) {
        slm.__trgCustom({ container: this.$cn2.get(0) });
      } else if (!slmConfig.appendTo) {
        this.$cn2.append(slm.render([]));
      }

      // Style Manager
      const sm = editor.StyleManager;
      this.sm = sm;
      const smConfig = sm.getConfig();
      const pfx = smConfig.stylePrefix;
      this.$header = $(`<div class="${pfx}header">${editor.t('styleManager.empty')}</div>`);
      this.$cn.append(this.$header);

      if (smConfig.custom) {
        sm.__trgCustom({ container: this.$cn2.get(0) });
      } else if (!smConfig.appendTo) {
        this.$cn2.append(sm.render());
      }

      // Create panel if not exists
      const pnCnt = 'views-container';
      this.panel = panels.getPanel(pnCnt);
      if (!this.panel) this.panel = panels.addPanel({ id: pnCnt });

      // Add all containers to the panel
      this.panel.set('appendContent', this.$cn).trigger(trgEvCnt);

      // Toggle Style Manager on target selection
      this.em = editor.getModel();
      this.listenTo(this.em, sm.events.target, this.toggleSm);
    }

    this.toggleSm();
  },

  /**
   * Toggle Style Manager visibility
   * @private
   */
  toggleSm() {
    const { sender, sm } = this;
    if ((sender && sender.get && !sender.get('active')) || !sm) return;

    if (sm.getSelected()) {
      this.$cn2?.show();
      this.$header?.hide();
    } else {
      this.$cn2?.hide();
      this.$header?.show();
    }
  },

  stop() {
    this.$cn2?.hide();
    this.$header?.hide();
  },
};
