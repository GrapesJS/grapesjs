import { isUndefined } from 'underscore';
import { on, off } from 'utils/mixins';
import Dragger from 'utils/Dragger';

module.exports = {
  run(editor, sender, opts = {}) {
    const { id } = this;
    const { target, options = {} } = opts;
    const { onEnd, event } = options;
    const config = {
      ...options,
      doc: target.getEl().ownerDocument,
      onStart() {
        target.addStyle({ position: 'absolute' });
      },
      onEnd() {
        onEnd && onEnd();
        editor.stopCommand(id);
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
