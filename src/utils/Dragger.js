import { bindAll, isFunction, result } from 'underscore';
import { on, off } from 'utils/mixins';

export default class Dragger {
  /**
   * Init the dragger
   * @param  {Object} opts
   */
  constructor(opts = {}) {
    this.opts = {
      /**
       * Callback on start
       * onStart(ev, dragger) {
       *  console.log('pointer start', dragger.startPointer, 'position start', dragger.startPosition);
       * },
       */
      onStart: null,
      /**
       * Callback on drag
       * onDrag(ev, dragger) {
       *  console.log('pointer', dragger.currentPointer, 'position', dragger.position, 'delta', dragger.delta);
       * },
       */
      onDrag: null,
      /**
       * Callback on drag
       * onEnd(ev, dragger) {
       *  console.log('pointer', dragger.currentPointer, 'position', dragger.position, 'delta', dragger.delta);
       * },
       */
      onEnd: null,
      /**
       * Indicate a callback where to pass an object with new coordinates
       */
      setPosition: null,
      /**
       * Indicate a callback where to get initial coordinates.
       * getPosition: () => {
       *  ...
       *  return { x: 10, y: 100 }
       * }
       */
      getPosition: null,

      // Document on which listen to pointer events
      doc: 0,

      // Scale result points, can also be a function
      scale: 1
    };
    bindAll(this, 'drag', 'stop');
    this.setOptions(opts);
    this.delta = { x: 0, y: 0 };
    return this;
  }

  /**
   * Update options
   * @param {Object} options
   */
  setOptions(opts = {}) {
    this.opts = {
      ...this.opts,
      ...opts
    };
  }

  toggleDrag(enable) {
    const docs = this.getDocumentEl();
    const method = enable ? 'on' : 'off';
    const methods = { on, off };
    methods[method](docs, 'mousemove', this.drag);
    methods[method](docs, 'mouseup', this.stop);
  }

  /**
   * Start dragging
   * @param  {Event} e
   */
  start(ev) {
    const { onStart } = this.opts;
    this.toggleDrag(1);
    this.startPointer = this.getPointerPos(ev);
    isFunction(onStart) && onStart(ev, this);
    this.startPosition = this.getStartPosition();
    this.drag(ev);
  }

  /**
   * Drag event
   * @param  {Event} event
   */
  drag(ev) {
    const { opts } = this;
    const { onDrag } = opts;
    const { startPointer } = this;
    const currentPos = this.getPointerPos(ev);
    const delta = {
      x: currentPos.x - startPointer.x,
      y: currentPos.y - startPointer.y
    };
    let { lockedAxis } = this;

    // Lock one axis
    if (ev.shiftKey) {
      lockedAxis = !lockedAxis && this.detectAxisLock(delta.x, delta.y);
    } else {
      lockedAxis = null;
    }

    if (lockedAxis === 'x') {
      delta.x = startPointer.x;
    } else if (lockedAxis === 'y') {
      delta.y = startPointer.y;
    }

    ['x', 'y'].forEach(co => (delta[co] = delta[co] * result(opts, 'scale')));
    this.lockedAxis = lockedAxis;
    this.delta = delta;
    this.move(delta.x, delta.y);
    this.currentPointer = currentPos;
    isFunction(onDrag) && onDrag(ev, this);

    // In case the mouse button was released outside of the window
    ev.which === 0 && this.stop(ev);
  }

  /**
   * Stop dragging
   */
  stop(ev) {
    const { delta } = this;
    this.toggleDrag();
    this.lockedAxis = null;
    this.move(delta.x, delta.y, 1);
    const { onEnd } = this.opts;
    isFunction(onEnd) && onEnd(ev, this);
  }

  /**
   * Move the element
   * @param  {integer} x
   * @param  {integer} y
   */
  move(x, y, end) {
    const { el, opts } = this;
    const pos = this.startPosition;
    if (!pos) return;
    const { setPosition } = opts;
    const xPos = pos.x + x;
    const yPos = pos.y + y;
    this.position = {
      x: xPos,
      y: yPos,
      end
    };

    isFunction(setPosition) && setPosition(this.position);

    if (el) {
      el.style.left = `${xPos}px`;
      el.style.top = `${yPos}px`;
    }
  }

  /**
   * Returns documents
   */
  getDocumentEl(el) {
    const { doc } = this.opts;
    el = el || this.el;

    if (!this.docs) {
      const docs = [document];
      el && docs.push(el.ownerDocument);
      doc && docs.push(doc);
      this.docs = docs;
    }

    return this.docs;
  }

  /**
   * Get mouse coordinates
   * @param  {Event} event
   * @return {Object}
   */
  getPointerPos(ev) {
    const getPos = this.opts.getPointerPosition;
    return getPos
      ? getPos(ev)
      : {
          x: ev.clientX,
          y: ev.clientY
        };
  }

  getStartPosition() {
    const { el, opts } = this;
    const getPos = opts.getPosition;
    let result = { x: 0, y: 0 };

    if (isFunction(getPos)) {
      result = getPos();
    } else if (el) {
      result = {
        x: parseFloat(el.style.left),
        y: parseFloat(el.style.top)
      };
    }

    return result;
  }

  detectAxisLock(x, y) {
    const relX = x;
    const relY = y;
    const absX = Math.abs(relX);
    const absY = Math.abs(relY);

    // Vertical or Horizontal lock
    if (relY >= absX || relY <= -absX) {
      return 'x';
    } else if (relX > absY || relX < -absY) {
      return 'y';
    }
  }
}
