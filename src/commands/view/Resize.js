module.exports = {

  run(editor, sender, opts) {
    var opt = opts || {};
    var el = opt.el || '';
    var canvas = editor.Canvas;
    var canvasResizer = this.canvasResizer;
    var options = opt.options || {};
    var canvasView = canvas.getCanvasView();

    // Create the resizer for the canvas if not yet created
    if(!canvasResizer || opt.forceNew) {
      options.ratioDefault = 1;
      options.appendTo = canvas.getResizerEl();
      options.prefix = editor.getConfig().stylePrefix;
      options.posFetcher = canvasView.getElementPos.bind(canvasView);
      options.mousePosFetcher = canvas.getMouseRelativePos;
      this.canvasResizer = editor.Utils.Resizer.init(options);
      canvasResizer = this.canvasResizer;
    }

    canvasResizer.setOptions(options);
    canvasResizer.focus(el);
    return canvasResizer;
  },

  stop() {
    if(this.canvasResizer)
      this.canvasResizer.blur();
  },

};
