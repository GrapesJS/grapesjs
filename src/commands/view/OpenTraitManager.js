module.exports = {

  run(editor, sender) {
    var config = editor.Config;
    var pfx = config.stylePrefix;
    var tm = editor.TraitManager;
    var panelC;
    if(!this.obj){
      var tmView = tm.getTraitsViewer();
      var confTm = tm.getConfig();
      this.obj = $('<div/>')
      .append('<div class="'+pfx+'traits-label">' + confTm.labelContainer + '</div>')
      .get(0);
      this.obj.appendChild(tmView.render().el);
      var panels = editor.Panels;
      if(!panels.getPanel('views-container'))
        panelC = panels.addPanel({id: 'views-container'});
      else
        panelC = panels.getPanel('views-container');
      panelC.set('appendContent', this.obj).trigger('change:appendContent');
    }

    this.obj.style.display = 'block';
  },

  stop() {
    if(this.obj)
      this.obj.style.display = 'none';
  }
};
