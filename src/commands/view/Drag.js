module.exports = {

  run(editor, sender, opts) {
    var el = (opts && opts.el) || '';
    var canvas = editor.Canvas;
    var dragger = this.dragger;
    var options = opts.options || {};
    var canvasView = canvas.getCanvasView();
    options.prefix = editor.getConfig().stylePrefix;
    options.mousePosFetcher = canvas.getMouseRelativePos;
    options.posFetcher = canvasView.getElementPos.bind(canvasView);

    // Create the resizer for the canvas if not yet created
    if(!dragger) {
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
    if(this.canvasResizer)
      this.canvasResizer.blur();
  },

};
