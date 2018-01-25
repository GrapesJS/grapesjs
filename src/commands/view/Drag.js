module.exports = {
  run(editor, sender, opts) {
    let el = (opts && opts.el) || '';
    let canvas = editor.Canvas;
    let dragger = this.dragger;
    let options = opts.options || {};
    let canvasView = canvas.getCanvasView();
    options.prefix = editor.getConfig().stylePrefix;
    options.mousePosFetcher = canvas.getMouseRelativePos;
    options.posFetcher = canvasView.getElementPos.bind(canvasView);

    // Create the resizer for the canvas if not yet created
    if (!dragger) {
      dragger = editor.Utils.Dragger.init(options);
      this.dragger = dragger;
    }

    dragger.setOptions(options);
    dragger.focus(el);

    if (options.event) {
      dragger.start(options.event);
    }

    return dragger;
  },

  stop() {
    if (this.canvasResizer) this.canvasResizer.blur();
  }
};
