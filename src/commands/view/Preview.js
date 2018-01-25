module.exports = {
  getPanels(editor) {
    if (!this.panels) this.panels = editor.Panels.getPanelsEl();
    return this.panels;
  },

  tglPointers(editor, v) {
    let elP = editor.Canvas.getBody().querySelectorAll(
      '.' + this.ppfx + 'no-pointer'
    );
    _.each(elP, item => {
      item.style.pointerEvents = v ? '' : 'all';
    });
  },

  run(editor, sender) {
    if (sender && sender.set) sender.set('active', false);
    editor.stopCommand('sw-visibility');
    editor.getModel().stopDefault();
    let that = this;
    let panels = this.getPanels(editor);
    let canvas = editor.Canvas.getElement();
    let editorEl = editor.getEl();
    let pfx = editor.Config.stylePrefix;
    if (!this.helper) {
      this.helper = document.createElement('span');
      this.helper.className = pfx + 'off-prv fa fa-eye-slash';
      editorEl.appendChild(this.helper);
      this.helper.onclick = () => {
        editor.stopCommand('preview');
      };
    }
    this.helper.style.display = 'inline-block';
    this.tglPointers(editor);

    /*
    editor.Canvas.getBody().querySelectorAll('.' + pfx + 'no-pointer').forEach(function(){
      this.style.pointerEvents = 'all';
    });*/

    panels.style.display = 'none';
    let canvasS = canvas.style;
    canvasS.width = '100%';
    canvasS.height = '100%';
    canvasS.top = '0';
    canvasS.left = '0';
    canvasS.padding = '0';
    canvasS.margin = '0';
    editor.trigger('change:canvasOffset');
  },

  stop(editor, sender) {
    let panels = this.getPanels(editor);
    editor.runCommand('sw-visibility');
    editor.getModel().runDefault();
    panels.style.display = 'block';
    let canvas = editor.Canvas.getElement();
    canvas.setAttribute('style', '');
    if (this.helper) {
      this.helper.style.display = 'none';
    }
    editor.trigger('change:canvasOffset');
    this.tglPointers(editor, 1);
  }
};
