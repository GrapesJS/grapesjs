module.exports = {

  run(editor, sender, opts) {
    var el = (opts && opts.el) || '';
    var canvas = editor.Canvas;
    var dragger = this.dragger;
    var options = opts.options || {};

    // Create the resizer for the canvas if not yet created
    if(!dragger) {
      var canvasView = canvas.getCanvasView();
      options.prefix = editor.getConfig().stylePrefix;
      options.posFetcher = canvasView.getElementPos.bind(canvasView);
      options.mousePosFetcher = canvas.getMouseRelativePos;
      dragger = editor.Utils.Dragger.init(options);
      this.dragger = dragger;
    }

    dragger.setOptions(options);
    dragger.focus(el);

    if (options.event) {
      dragger.start(options.event);
    }
  },

  stop() {
    if(this.canvasResizer)
      this.canvasResizer.blur();
  },

};
