const $ = Backbone.$;

module.exports = {
  run(editor, sender) {
    let config = editor.Config;
    let pfx = config.stylePrefix;
    let tm = editor.TraitManager;
    let panelC;
    if (!this.obj) {
      let tmView = tm.getTraitsViewer();
      let confTm = tm.getConfig();
      this.obj = $('<div></div>')
        .append(
          '<div class="' +
            pfx +
            'traits-label">' +
            confTm.labelContainer +
            '</div>'
        )
        .get(0);
      this.obj.appendChild(tmView.render().el);
      let panels = editor.Panels;
      if (!panels.getPanel('views-container'))
        panelC = panels.addPanel({ id: 'views-container' });
      else panelC = panels.getPanel('views-container');
      panelC.set('appendContent', this.obj).trigger('change:appendContent');
    }

    this.obj.style.display = 'block';
  },

  stop() {
    if (this.obj) this.obj.style.display = 'none';
  }
};
