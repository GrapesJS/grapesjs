export default {
  run(editor, sender, opts) {
    var opt = opts || {};
    var el = opt.el || '';
    var canvas = editor.Canvas;
    var canvasResizer = this.canvasResizer;
    var options = opt.options || {};
    var canvasView = canvas.getCanvasView();
    options.appendTo = canvas.getResizerEl();
    options.prefix = editor.getConfig().stylePrefix;
    options.posFetcher = canvasView.getElementPos.bind(canvasView);
    options.mousePosFetcher = canvas.getMouseRelativePos;

    // Create the resizer for the canvas if not yet created
    if (!canvasResizer || opt.forceNew) {
      this.canvasResizer = editor.Utils.Resizer.init(options);
      canvasResizer = this.canvasResizer;
    }

    canvasResizer.setOptions(options);
    canvasResizer.blur();
    canvasResizer.focus(el);
    return canvasResizer;
  },

  stop() {
    const resizer = this.canvasResizer;
    resizer && resizer.blur();
  }
};
