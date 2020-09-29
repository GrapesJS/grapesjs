import Backbone from 'backbone';

const $ = Backbone.$;

export default {
  run(editor, sender) {
    this.sender = sender;
    const em = editor.getModel();

    var config = editor.Config;
    var pfx = config.stylePrefix;
    var tm = editor.TraitManager;
    var panelC;

    if (!this.$cn) {
      var tmView = tm.getTraitsViewer();
      var confTm = tm.getConfig();
      this.$cn = $('<div></div>');
      this.$cn2 = $('<div></div>');
      this.$cn.append(this.$cn2);
      this.$header = $('<div>').append(
        `<div class="${confTm.stylePrefix}header">${em.t(
          'traitManager.empty'
        )}</div>`
      );
      this.$cn.append(this.$header);
      this.$cn2.append(
        `<div class="${pfx}traits-label">${em.t('traitManager.label')}</div>`
      );
      this.$cn2.append(tmView.render().el);
      var panels = editor.Panels;

      if (!panels.getPanel('views-container'))
        panelC = panels.addPanel({ id: 'views-container' });
      else panelC = panels.getPanel('views-container');

      panelC
        .set('appendContent', this.$cn.get(0))
        .trigger('change:appendContent');

      this.target = editor.getModel();
      this.listenTo(this.target, 'component:toggled', this.toggleTm);
    }

    this.toggleTm();
  },

  /**
   * Toggle Trait Manager visibility
   * @private
   */
  toggleTm() {
    const sender = this.sender;
    if (sender && sender.get && !sender.get('active')) return;

    if (this.target.getSelectedAll().length === 1) {
      this.$cn2.show();
      this.$header.hide();
    } else {
      this.$cn2.hide();
      this.$header.show();
    }
  },

  stop() {
    this.$cn2 && this.$cn2.hide();
    this.$header && this.$header.hide();
  }
};
