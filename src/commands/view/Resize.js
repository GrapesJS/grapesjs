module.exports = {
  run(editor, sender, opts) {
    let opt = opts || {};
    let el = opt.el || '';
    let canvas = editor.Canvas;
    let canvasResizer = this.canvasResizer;
    let options = opt.options || {};
    let canvasView = canvas.getCanvasView();
    options.ratioDefault = 1;
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
    canvasResizer.focus(el);
    return canvasResizer;
  },

  stop() {
    const resizer = this.canvasResizer;
    resizer && resizer.blur();
  }
};
