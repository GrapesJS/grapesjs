import _ from 'underscore';

module.exports = {
  getPanels(editor) {
    if (!this.panels) this.panels = editor.Panels.getPanelsEl();
    return this.panels;
  },

  tglPointers(editor, v) {
    var elP = editor.Canvas.getBody().querySelectorAll(
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
    var that = this;
    var panels = this.getPanels(editor);
    var canvas = editor.Canvas.getElement();
    var editorEl = editor.getEl();
    var pfx = editor.Config.stylePrefix;
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
    var canvasS = canvas.style;
    canvasS.width = '100%';
    canvasS.height = '100%';
    canvasS.top = '0';
    canvasS.left = '0';
    canvasS.padding = '0';
    canvasS.margin = '0';
    editor.trigger('change:canvasOffset');
  },

  stop(editor, sender) {
    var panels = this.getPanels(editor);
    editor.runCommand('sw-visibility');
    editor.getModel().runDefault();
    panels.style.display = 'block';
    var canvas = editor.Canvas.getElement();
    canvas.setAttribute('style', '');
    if (this.helper) {
      this.helper.style.display = 'none';
    }
    editor.trigger('change:canvasOffset');
    this.tglPointers(editor, 1);
  }
};
