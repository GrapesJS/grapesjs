import { keys, bindAll, each } from 'underscore';
import Dragger from 'utils/Dragger';

module.exports = {
  run(editor, sender, opts = {}) {
    bindAll(
      this,
      'setPosition',
      'onStart',
      'onDrag',
      'onEnd',
      'getPosition',
      'getGuidesStatic',
      'renderGuide',
      'getGuidesTarget'
    );
    const { target, event, mode, dragger = {} } = opts;
    const { Canvas } = editor;
    const el = target.getEl();
    const scale = Canvas.getZoomMultiplier();
    const config = {
      scale,
      doc: el.ownerDocument,
      onStart: this.onStart,
      onEnd: this.onEnd,
      onDrag: this.onDrag,
      getPosition: this.getPosition,
      setPosition: this.setPosition,
      getGuidesStatic: () => this.guidesStatic,
      getGuidesTarget: () => this.guidesTarget,
      ...dragger
    };
    this.setupGuides();
    this.opts = opts;
    this.editor = editor;
    this.em = editor.getModel();
    this.target = target;
    this.isTran = mode == 'translate';
    this.guidesContainer = this.getGuidesContainer();
    this.guidesTarget = this.getGuidesTarget();
    this.guidesStatic = this.getGuidesStatic();
    window.guidesTarget = this.guidesTarget;
    let drg = this.dragger;

    if (!drg) {
      drg = new Dragger(config);
      this.dragger = drg;
    } else {
      drg.setOptions(config);
    }

    event && drg.start(event);
    this.toggleDrag(1);

    return drg;
  },

  stop() {
    this.toggleDrag();
  },

  setupGuides() {
    (this.guides || []).forEach(item => {
      const { guide } = item;
      guide.parentNode.removeChild(guide);
    });
    this.guides = [];
  },

  getGuidesContainer() {
    let { guidesEl } = this;

    if (!guidesEl) {
      const { editor, em } = this;
      const pfx = editor.getConfig('stylePrefix');
      guidesEl = document.createElement('div');
      guidesEl.className = `${pfx}guides`;
      editor.Canvas.getToolsEl().appendChild(guidesEl);
      this.guidesEl = guidesEl;
      em.on('canvas:update', () => {
        this.updateGuides();
        this.guides.forEach(item => this.renderGuide(item));
      });
    }

    return guidesEl;
  },

  getGuidesStatic() {
    let result = [];
    const el = this.target.getEl();
    each(
      el.parentNode.children,
      item =>
        (result = result.concat(el !== item ? this.getElementGuides(item) : []))
    );
    return result;
  },

  getGuidesTarget() {
    return this.getElementGuides(this.target.getEl());
  },

  updateGuides(guides) {
    (guides || this.guides).forEach(item => {
      const { origin } = item;
      const { top, height, left, width } = editor.Canvas.getElementPos(origin);

      switch (item.type) {
        case 't':
          return (item.y = top);
        case 'b':
          return (item.y = top + height);
        case 'l':
          return (item.x = left);
        case 'r':
          return (item.x = left + width);
        case 'x':
          return (item.x = left + width / 2);
        case 'y':
          return (item.y = top + height / 2);
      }
    });
  },

  getGuidePosUpdate(item, rect) {
    const result = {};
    const { top, height, left, width } = rect;

    switch (item.type) {
      case 't':
        result.y = top;
        break;
      case 'b':
        result.y = top + height;
        break;
      case 'l':
        result.x = left;
        break;
      case 'r':
        result.x = left + width;
        break;
      case 'x':
        result.x = left + width / 2;
        break;
      case 'y':
        result.y = top + height / 2;
        break;
    }

    return result;
  },

  renderGuide(item = {}) {
    const el = item.guide || document.createElement('div');
    const { Canvas } = this.editor;
    const { topScroll, top } = Canvas.getRect();
    const frameTop = Canvas.getCanvasView().getFrameOffset().top;
    // const elRect = this.getGuidePosUpdate(item, el.getBoundingClientRect());
    // console.log('elRect', item.type, elRect);
    const un = 'px';
    const guideSize = item.active ? 2 : 1;
    let numEl = el.children[0];
    el.style = `position: absolute; background-color: ${
      item.active ? 'green' : 'red'
    };`;

    if (!el.children.length) {
      numEl = document.createElement('div');
      numEl.style =
        'position: absolute; color: red; padding: 5px; top: 0; left: 0;';
      el.appendChild(numEl);
    }

    if (item.y) {
      el.style.width = '100%';
      el.style.height = `${guideSize}${un}`;
      el.style.top = `${item.y}${un}`;
      el.style.left = 0;
      // numEl.innerHTML = elRect.y;
    } else {
      el.style.width = `${guideSize}${un}`;
      el.style.height = '100%';
      el.style.left = `${item.x}${un}`;
      el.style.top = `${topScroll - frameTop + top}${un}`;
      // numEl.innerHTML = elRect.x;
      // numEl.innerHTML = el.style.left;
    }

    !item.guide && this.guidesContainer.appendChild(el);
    return el;
  },

  getElementGuides(el) {
    const { editor } = this;
    const { top, height, left, width } = editor.Canvas.getElementPos(el);
    const guides = [
      { type: 't', y: top }, // Top
      { type: 'b', y: top + height }, // Bottom
      { type: 'l', x: left }, // Left
      { type: 'r', x: left + width }, // Right
      { type: 'x', x: left + width / 2 }, // Mid x
      { type: 'y', y: top + height / 2 } // Mid y
    ].map(item => ({
      ...item,
      origin: el,
      guide: this.renderGuide(item)
    }));
    guides.forEach(item => this.guides.push(item));

    return guides;
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

  onDrag() {
    const { guidesTarget } = this;
    this.updateGuides(guidesTarget);
    guidesTarget.forEach(item => this.renderGuide(item));
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
