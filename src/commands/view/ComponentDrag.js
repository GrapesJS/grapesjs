import { keys } from 'underscore';
import Dragger from 'utils/Dragger';

module.exports = {
  run(editor, sender, opts = {}) {
    const { id } = this;
    const { target, options = {} } = opts;
    const { onEnd, event } = options;
    const { Canvas } = editor;
    const el = target.getEl();
    const scale = Canvas.getZoomMultiplier();
    const setPosition = ({ x, y, end, position, width, height }) => {
      const unit = 'px';
      const adds = { position, width, height };
      const style = {
        left: `${x}${unit}`,
        top: `${y}${unit}`,
        e: !end ? 1 : '' // this will trigger the final change
      };
      keys(adds).forEach(add => {
        const prop = adds[add];
        if (prop) style[add] = prop;
      });
      target.addStyle(style, { avoidStore: !end });
    };
    const config = {
      ...options,
      scale,
      doc: el.ownerDocument,
      onStart() {
        const style = target.getStyle();
        const position = 'absolute';

        if (style.position !== position) {
          const { left, top, width, height } = Canvas.offset(el);
          setPosition({ x: left, y: top, position, width, height });
        }
      },
      onEnd() {
        onEnd && onEnd();
        editor.stopCommand(id);
      },
      getPosition() {
        const { left, top } = target.getStyle();
        const result = {
          x: parseFloat(left),
          y: parseFloat(top)
        };

        return result;
      },
      setPosition
    };

    let dragger = this.dragger;

    if (!dragger) {
      dragger = new Dragger(config);
      this.dragger = dragger;
    } else {
      dragger.setOptions(config);
    }

    event && dragger.start(event);
    this.toggleDrag(1);

    return dragger;
  },

  stop() {
    this.toggleDrag();
  },

  toggleDrag(enable) {
    const { ppfx } = this;
    const methodCls = enable ? 'add' : 'remove';
    const canvas = this.getCanvas();
    const classes = [`${ppfx}is__grabbing`];
    classes.forEach(cls => canvas.classList[methodCls](cls));
  }
};
