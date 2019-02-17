import { isUndefined } from 'underscore';
import Dragger from 'utils/Dragger';

module.exports = {
  run(editor, sender, opts = {}) {
    const { target } = opts;
    var el = (opts && opts.el) || '';
    var canvas = editor.Canvas;
    var dragger = this.dragger;
    var options = opts.options || {};
    var canvasView = canvas.getCanvasView();
    options.prefix = editor.getConfig().stylePrefix;
    options.mousePosFetcher = canvas.getMouseRelativePos;
    options.posFetcher = canvasView.getElementPos.bind(canvasView);

    // Create the resizer for the canvas if not yet created
    if (!dragger) {
      dragger = new Dragger({
        ...options,
        doc: target.getEl().ownerDocument,
        onStart() {
          target.addStyle({ position: 'absolute' });
        },
        getPosition() {
          const style = target.getStyle();
          let { left, top } = style;

          if (isUndefined(left) || isUndefined(top)) {
            const rect = target.getEl().getBoundingClientRect();
            left = rect.left;
            top = rect.top;
          }

          const result = {
            x: parseFloat(left),
            y: parseFloat(top)
          };

          return result;
        },
        setPosition({ x, y, end }) {
          const unit = 'px';

          target.addStyle(
            {
              left: `${x}${unit}`,
              top: `${y}${unit}`,
              e: !end ? 1 : '' // this will trigger the final change
            },
            { avoidStore: !end }
          );
        }
      });
      this.dragger = dragger;
    }

    dragger.setOptions(options);

    if (options.event) {
      dragger.start(options.event);
    }

    return dragger;
  }
};
