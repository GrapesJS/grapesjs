import Dragger from 'utils/Dragger';

module.exports = {
  run(editor, sender, opts = {}) {
    const { id } = this;
    const { target, options = {} } = opts;
    const { onEnd, event } = options;
    const scale = editor.Canvas.getZoomMultiplier();
    const setPosition = ({ x, y, end }) => {
      const unit = 'px';
      target.addStyle(
        {
          left: `${x}${unit}`,
          top: `${y}${unit}`,
          e: !end ? 1 : '' // this will trigger the final change
        },
        { avoidStore: !end }
      );
    };
    const config = {
      ...options,
      scale,
      doc: target.getEl().ownerDocument,
      onStart() {
        const style = target.getStyle();
        const position = 'absolute';

        if (style.position !== position) {
          const { left, top } = target.getEl().getBoundingClientRect();
          target.addStyle({ position });
          setPosition({ x: left, y: top });
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
