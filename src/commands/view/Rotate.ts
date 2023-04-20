import Rotator from '../../utils/Rotator';
import { CommandObject } from './CommandAbstract';

export default {
  run(editor, sender, opts) {
    const opt = opts || {};
    const canvas = editor.Canvas;
    const canvasView = canvas.getCanvasView();
    const options = {
      appendTo: canvas.getResizerEl(),
      prefix: editor.getConfig().stylePrefix,
      posFetcher: canvasView.getElementPos.bind(canvasView),
      mousePosFetcher: canvas.getMouseRelativeCanvas.bind(canvas),
      ...(opt.options || {}),
    };
    let { canvasRotator } = this;

    // Create the rotator for the canvas if not yet created
    if (!canvasRotator || opt.forceNew) {
      this.canvasRotator = new editor.Utils.Rotator(options);
      canvasRotator = this.canvasRotator;
    }

    canvasRotator.setOptions(options, true);
    canvasRotator.blur();
    canvasRotator.focus(opt.el);
    return canvasRotator;
  },

  stop() {
    this.canvasRotator?.blur();
  },
} as CommandObject<{ options?: {}; forceNew?: boolean; el: HTMLElement }, { canvasRotator?: Rotator }>;
