import Resizer, { ResizerOptions } from '../../utils/Resizer';
import { CommandObject } from './CommandAbstract';

export default {
  run(editor, sender, opts) {
    const opt = opts || {};
    const canvas = editor.Canvas;
    const canvasView = canvas.getCanvasView();
    const options: ResizerOptions = {
      appendTo: canvas.getResizerEl(),
      prefix: editor.getConfig().stylePrefix,
      posFetcher: canvasView.getElementPos.bind(canvasView),
      mousePosFetcher: canvas.getMouseRelativePos.bind(canvas),
      ...(opt.options || {}),
    };
    let { canvasResizer } = this;

    // Create the resizer for the canvas if not yet created
    if (!canvasResizer || opt.forceNew) {
      this.canvasResizer = new editor.Utils.Resizer(options);
      canvasResizer = this.canvasResizer;
    }

    canvasResizer.setOptions(options, true);
    canvasResizer.blur();
    canvasResizer.focus(opt.el);
    return canvasResizer;
  },

  stop() {
    this.canvasResizer?.blur();
  },
} as CommandObject<{ options?: {}; forceNew?: boolean; el: HTMLElement }, { canvasResizer?: Resizer }>;
