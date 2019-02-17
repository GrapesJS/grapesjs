import { keys, bindAll } from 'underscore';
import Dragger from 'utils/Dragger';

module.exports = {
  run(editor, sender, opts = {}) {
    bindAll(this, 'setPosition', 'onStart', 'onEnd', 'getPosition');
    const { target, event, mode } = opts;
    const { Canvas } = editor;
    const el = target.getEl();
    const scale = Canvas.getZoomMultiplier();
    const config = {
      scale,
      doc: el.ownerDocument,
      onStart: this.onStart,
      onEnd: this.onEnd,
      getPosition: this.getPosition,
      setPosition: this.setPosition
    };
    this.opts = opts;
    this.editor = editor;
    this.target = target;
    this.isTran = mode == 'translate';
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

  getPosition() {
    const { target } = this;
    const { left, top } = target.getStyle();
    return {
      x: parseFloat(left),
      y: parseFloat(top)
    };
  },

  setPosition({ x, y, end, position, width, height }) {
    const { target } = this;
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
  },

  onStart() {
    const { target, editor } = this;
    const style = target.getStyle();
    const position = 'absolute';

    if (style.position !== position) {
      const { left, top, width, height } = editor.Canvas.offset(target.getEl());
      this.setPosition({ x: left, y: top, position, width, height });
    }
  },

  onEnd() {
    const { editor, opts, id } = this;
    const { onEnd } = opts;
    onEnd && onEnd();
    editor.stopCommand(id);
  },

  toggleDrag(on) {
    const { ppfx, editor } = this;
    const methodCls = on ? 'add' : 'remove';
    const canvas = this.getCanvas();
    const classes = [`${ppfx}is__grabbing`];
    classes.forEach(cls => canvas.classList[methodCls](cls));
    editor.Canvas[on ? 'startAutoscroll' : 'stopAutoscroll']();
  }
};
