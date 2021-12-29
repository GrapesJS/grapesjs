import Backbone from 'backbone';
const $ = Backbone.$;

export default {
  run(em, sender) {
    this.sender = sender;

    if (!this.$cn) {
      const config = em.getConfig();
      const panels = em.Panels;
      const trgEvCnt = 'change:appendContent';
      this.$cn = $('<div></div>');
      this.$cn2 = $('<div></div>');
      this.$cn.append(this.$cn2);

      // Device Manager
      const dvm = em.DeviceManager;
      if (dvm && config.showDevices) {
        const devicePanel = panels.addPanel({ id: 'devices-c' });
        const dvEl = dvm.render();
        devicePanel.set('appendContent', dvEl).trigger(trgEvCnt);
      }

      // Selector Manager container
      const slm = em.SelectorManager;
      const slmConfig = slm.getConfig();
      if (slmConfig.custom) {
        slm.__trgCustom({ container: this.$cn2.get(0) });
      } else if (!slmConfig.appendTo) {
        this.$cn2.append(slm.render([]));
      }

      // Style Manager
      const sm = em.StyleManager;
      const smConfig = sm.getConfig();
      if (!smConfig.appendTo) {
        this.$cn2.append(sm.render());
        const pfx = smConfig.stylePrefix;
        this.$header = $(`<div class="${pfx}header">${em.t('styleManager.empty')}</div>`);
        this.$cn.append(this.$header);
      }

      // Create panel if not exists
      const pnCnt = 'views-container';
      this.panel = panels.getPanel(pnCnt);
      if (!this.panel) this.panel = panels.addPanel({ id: pnCnt });

      // Add all containers to the panel
      this.panel.set('appendContent', this.$cn).trigger(trgEvCnt);

      // Toggle Style Manager on target selection
      this.em = em.getModel();
      this.listenTo(this.em, sm.events.target, this.toggleSm);
    }

    this.toggleSm();
  },

  /**
   * Toggle Style Manager visibility
   * @private
   */
  toggleSm() {
    const { em, sender } = this;
    if ((sender && sender.get && !sender.get('active')) || !em) return;
    const { componentFirst } = em.get('SelectorManager').getConfig();
    const selectedAll = em.getSelectedAll().length;

    if (selectedAll === 1 || (selectedAll > 1 && componentFirst)) {
      this.$cn2 && this.$cn2.show();
      this.$header && this.$header.hide();
    } else {
      this.$cn2 && this.$cn2.hide();
      this.$header && this.$header.show();
    }
  },

  stop() {
    this.$cn2 && this.$cn2.hide();
    this.$header && this.$header.hide();
  },
};
