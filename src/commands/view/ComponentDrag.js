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

  getTranslate(transform, axis = 'x') {
    let result = 0;
    (transform || '').split(' ').forEach(item => {
      const itemStr = item.trim();
      const fn = `translate${axis.toUpperCase()}(`;
      if (itemStr.indexOf(fn) === 0)
        result = parseFloat(itemStr.replace(fn, ''));
    });
    return result;
  },

  setTranslate(transform, axis, value) {
    const fn = `translate${axis.toUpperCase()}(`;
    const val = `${fn}${value})`;
    let result = (transform || '')
      .split(' ')
      .map(item => {
        const itemStr = item.trim();
        if (itemStr.indexOf(fn) === 0) item = val;
        return item;
      })
      .join(' ');
    if (result.indexOf(fn) < 0) result += ` ${val}`;

    return result;
  },

  getPosition() {
    const { target, isTran } = this;
    const { left, top, transform } = target.getStyle();
    let x = 0;
    let y = 0;

    if (isTran) {
      x = this.getTranslate(transform);
      y = this.getTranslate(transform, 'y');
    } else {
      (x = parseFloat(left)), (y = parseFloat(top));
    }

    return { x, y };
  },

  setPosition({ x, y, end, position, width, height }) {
    const { target, isTran } = this;
    const unit = 'px';
    const en = !end ? 1 : ''; // this will trigger the final change
    const left = `${x}${unit}`;
    const top = `${y}${unit}`;

    if (isTran) {
      let transform = target.getStyle()['transform'] || '';
      transform = this.setTranslate(transform, 'x', left);
      transform = this.setTranslate(transform, 'y', top);
      return target.addStyle({ transform, en }, { avoidStore: !end });
    }

    const adds = { position, width, height };
    const style = { left, top, en };
    keys(adds).forEach(add => {
      const prop = adds[add];
      if (prop) style[add] = prop;
    });
    target.addStyle(style, { avoidStore: !end });
  },

  onStart() {
    const { target, editor, isTran } = this;
    const style = target.getStyle();
    const position = 'absolute';
    if (isTran) return;

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
