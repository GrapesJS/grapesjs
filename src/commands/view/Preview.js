import { each } from 'underscore';

const cmdVis = 'sw-visibility';

export default {
  getPanels(editor) {
    if (!this.panels) {
      this.panels = editor.Panels.getPanels();
    }

    return this.panels;
  },

  preventDrag(opts) {
    opts.abort = 1;
  },

  tglPointers(editor, val) {
    const body = editor.Canvas.getBody();
    const elP = body.querySelectorAll(`.${this.ppfx}no-pointer`);
    each(elP, item => (item.style.pointerEvents = val ? '' : 'all'));
  },

  tglEffects(on) {
    const mthEv = on ? 'on' : 'off';
    this.em[mthEv]('run:tlb-move:before', this.preventDrag);
  },

  run(editor, sender) {
    this.sender = sender;

    if (!this.shouldRunSwVisibility) {
      this.shouldRunSwVisibility = editor.Commands.isActive(cmdVis);
    }

    this.shouldRunSwVisibility && editor.stopCommand(cmdVis);
    editor.getModel().stopDefault();

    const panels = this.getPanels(editor);
    const canvas = editor.Canvas.getElement();
    const editorEl = editor.getEl();
    const pfx = editor.Config.stylePrefix;

    if (!this.helper) {
      const helper = document.createElement('span');
      helper.className = `${pfx}off-prv fa fa-eye-slash`;
      editorEl.appendChild(helper);
      helper.onclick = () => this.stopCommand();
      this.helper = helper;
    }

    this.helper.style.display = 'inline-block';
    this.tglPointers(editor);

    panels.forEach(panel => panel.set('visible', false));

    const canvasS = canvas.style;
    canvasS.width = '100%';
    canvasS.height = '100%';
    canvasS.top = '0';
    canvasS.left = '0';
    canvasS.padding = '0';
    canvasS.margin = '0';
    editor.refresh();
    this.tglEffects(1);
  },

  stop(editor) {
    const { sender = {} } = this;
    sender.set && sender.set('active', 0);
    const panels = this.getPanels(editor);

    if (this.shouldRunSwVisibility) {
      editor.runCommand(cmdVis);
      this.shouldRunSwVisibility = false;
    }

    editor.getModel().runDefault();
    panels.forEach(panel => panel.set('visible', true));

    const canvas = editor.Canvas.getElement();
    canvas.setAttribute('style', '');

    if (this.helper) {
      this.helper.style.display = 'none';
    }

    editor.refresh();
    this.tglPointers(editor, 1);
    this.tglEffects();
  }
};
