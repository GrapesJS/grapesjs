define(function() {
  return {

    run: function(editor, sender, opts) {
      var el = (opts && opts.el) || '';
      var canvas = editor.Canvas;
      var canvasResizer = this.canvasResizer;
      var options = opts.options || {};

      // Create the resizer for the canvas if not yet created
      if(!canvasResizer) {
        var canvasView = canvas.getCanvasView();
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
    },

    stop: function() {
      if(this.canvasResizer)
        this.canvasResizer.blur();
    },

  };
});
