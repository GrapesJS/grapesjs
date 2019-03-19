import { bindAll, isFunction, result, isUndefined } from 'underscore';
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

      /**
       * Get static guides
       */
      getGuidesStatic: () => [],

      /**
       * Get target guides
       */
      getGuidesTarget: () => [],

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
    const { onStart, getGuidesStatic, getGuidesTarget } = this.opts;
    this.toggleDrag(1);
    this.startPointer = this.getPointerPos(ev);
    isFunction(onStart) && onStart(ev, this);
    this.startPosition = this.getStartPosition();
    this.guidesStatic = getGuidesStatic();
    this.guidesTarget = getGuidesTarget();
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

    let diffY = 0;
    let diffX = 0;
    let { trgX, trgY } = this;
    const offset = 20;
    this.guidesTarget.forEach(trg => {
      trg.active = 0;

      this.guidesStatic.forEach(stat => {
        if (trg.y && stat.y) {
          // if (
          //   (trg.y >= stat.y && trg.y <= stat.y + offset) ||
          //   (trg.y <= stat.y && trg.y >= stat.y - offset)
          // ) {
          //   console.log('trg.y', trg.y, 'stat.y', stat.y, 'diff', trg.y - stat.y)
          //   diffY = (trg.y - stat.y);
          // }
          if (this.isPointIn(trg.y, stat.y)) {
            if (isUndefined(trgY)) {
              trgY = this.setGuideLock(trg, delta.y - (trg.y - stat.y));
            }
          }
        } else {
          if (this.isPointIn(trg.x, stat.x)) {
            if (isUndefined(trgX)) {
              trgX = this.setGuideLock(trg, delta.x - (trg.x - stat.x));
            }
          }
        }
      });

      if (trg.lock) trg.active = 1;
    });

    // if (diffY) {
    //   console.log( 'delta.y before', delta.y, 'diff Y ', diffY, 'delta.t after', delta.y - diffY);
    //   delta.y = delta.y - diffY;
    // }

    if (trgX && !this.isPointIn(delta.x, trgX.lock)) {
      this.setGuideLock(trgX, null);
      trgX = null;
    }

    if (trgY && !this.isPointIn(delta.y, trgY.lock)) {
      this.setGuideLock(trgY, null);
      trgY = null;
    }

    if (trgX && !isUndefined(trgX.lock)) {
      console.log(
        'locked X at:',
        trgX.lock,
        `(type: ${trgX.type})`,
        'delta.x: ',
        delta.x,
        `range (${trgX.lock - offset} - ${trgX.lock + offset})`
      );
      delta.x = trgX.lock;
    }

    if (trgY && !isUndefined(trgY.lock)) {
      console.log(
        'locked Y at:',
        trgY.lock,
        `(type: ${trgY.type})`,
        'delta.y: ',
        delta.y,
        `range (${trgY.lock - offset} - ${trgY.lock + offset})`
      );
      delta.y = trgY.lock;
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

  isPointIn(src, trg, offset = 20) {
    return (
      (src >= trg && src <= trg + offset) || (src <= trg && src >= trg - offset)
    );
  }

  getGuideLock(axis = 'x') {
    const trgName = `trg${axis.toUpperCase()}`;
    return this[trgName];
  }

  setGuideLock(guide, value) {
    const axis = !isUndefined(guide.x) ? 'X' : 'Y';
    const trgName = `trg${axis}`;

    if (value !== null) {
      guide.active = 1;
      guide.lock = value;
      this[trgName] = guide;
    } else {
      console.log(`UNLOCK ${axis}`, guide.lock);
      guide.active = 0;
      delete guide.lock;
      delete this[trgName];
    }

    return guide;
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
