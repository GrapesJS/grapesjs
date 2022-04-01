import { bindAll, isFunction, result, isUndefined } from 'underscore';
import { on, off, isEscKey, getPointerEvent } from './mixins';

const resetPos = () => ({ x: 0, y: 0 });

export default class Dragger {
  /**
   * Init the dragger
   * @param  {Object} opts
   */
  constructor(opts = {}) {
    this.opts = {
      /**
       * Element on which the drag will be executed. By default, the document will be used
       */
      container: null,
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

      // Static guides to be snapped
      guidesStatic: null,

      // Target guides that will snap to static one
      guidesTarget: null,

      // Offset before snap to guides
      snapOffset: 5,

      // Document on which listen to pointer events
      doc: 0,

      // Scale result points, can also be a function
      scale: 1,
    };
    bindAll(this, 'drag', 'stop', 'keyHandle', 'handleScroll');
    this.setOptions(opts);
    this.delta = resetPos();
    return this;
  }

  /**
   * Update options
   * @param {Object} options
   */
  setOptions(opts = {}) {
    this.opts = {
      ...this.opts,
      ...opts,
    };
  }

  toggleDrag(enable) {
    const docs = this.getDocumentEl();
    const container = this.getContainerEl();
    const win = this.getWindowEl();
    const method = enable ? 'on' : 'off';
    const methods = { on, off };
    methods[method](container, 'mousemove dragover', this.drag);
    methods[method](docs, 'mouseup dragend touchend', this.stop);
    methods[method](docs, 'keydown', this.keyHandle);
    methods[method](win, 'scroll', this.handleScroll);
  }

  handleScroll() {
    const { lastScroll, delta } = this;
    const actualScroll = this.getScrollInfo();
    const scrollDiff = {
      x: actualScroll.x - lastScroll.x,
      y: actualScroll.y - lastScroll.y,
    };
    this.move(delta.x + scrollDiff.x, delta.y + scrollDiff.y);
    this.lastScrollDiff = scrollDiff;
  }

  /**
   * Start dragging
   * @param  {Event} e
   */
  start(ev) {
    const { opts } = this;
    const { onStart } = opts;
    this.toggleDrag(1);
    this.startPointer = this.getPointerPos(ev);
    this.guidesStatic = result(opts, 'guidesStatic') || [];
    this.guidesTarget = result(opts, 'guidesTarget') || [];
    isFunction(onStart) && onStart(ev, this);
    this.startPosition = this.getStartPosition();
    this.lastScrollDiff = resetPos();
    this.globScrollDiff = resetPos();
    this.drag(ev);
  }

  /**
   * Drag event
   * @param  {Event} event
   */
  drag(ev) {
    const { opts, lastScrollDiff, globScrollDiff } = this;
    const { onDrag } = opts;
    const { startPointer } = this;
    const currentPos = this.getPointerPos(ev);
    const glDiff = {
      x: globScrollDiff.x + lastScrollDiff.x,
      y: globScrollDiff.y + lastScrollDiff.y,
    };
    this.globScrollDiff = glDiff;
    const delta = {
      x: currentPos.x - startPointer.x + glDiff.x,
      y: currentPos.y - startPointer.y + glDiff.y,
    };
    this.lastScrollDiff = resetPos();
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

    const moveDelta = delta => {
      ['x', 'y'].forEach(co => (delta[co] = delta[co] * result(opts, 'scale')));
      this.delta = delta;
      this.move(delta.x, delta.y);
      isFunction(onDrag) && onDrag(ev, this);
    };
    const deltaPre = { ...delta };
    this.currentPointer = currentPos;
    this.lockedAxis = lockedAxis;
    this.lastScroll = this.getScrollInfo();
    moveDelta(delta);

    if (this.guidesTarget.length) {
      const { newDelta, trgX, trgY } = this.snapGuides(deltaPre);
      (trgX || trgY) && moveDelta(newDelta);
    }

    // In case the mouse button was released outside of the window
    ev.which === 0 && this.stop(ev);
  }

  /**
   * Check if the delta hits some guide
   */
  snapGuides(delta) {
    const newDelta = delta;
    let { trgX, trgY } = this;

    this.guidesTarget.forEach(trg => {
      // Skip the guide if its locked axis already exists
      if ((trg.x && this.trgX) || (trg.y && this.trgY)) return;
      trg.active = 0;

      this.guidesStatic.forEach(stat => {
        if ((trg.y && stat.x) || (trg.x && stat.y)) return;
        const isY = trg.y && stat.y;
        const axs = isY ? 'y' : 'x';
        const trgPoint = trg[axs];
        const statPoint = stat[axs];
        const deltaPoint = delta[axs];
        const trgGuide = isY ? trgY : trgX;

        if (this.isPointIn(trgPoint, statPoint)) {
          if (isUndefined(trgGuide)) {
            const trgValue = deltaPoint - (trgPoint - statPoint);
            this.setGuideLock(trg, trgValue);
          }
        }
      });
    });

    trgX = this.trgX;
    trgY = this.trgY;

    ['x', 'y'].forEach(co => {
      const axis = co.toUpperCase();
      let trg = this[`trg${axis}`];

      if (trg && !this.isPointIn(delta[co], trg.lock)) {
        this.setGuideLock(trg, null);
        trg = null;
      }

      if (trg && !isUndefined(trg.lock)) {
        newDelta[co] = trg.lock;
      }
    });

    return {
      newDelta,
      trgX: this.trgX,
      trgY: this.trgY,
    };
  }

  isPointIn(src, trg, { offset } = {}) {
    const ofst = offset || this.opts.snapOffset;
    return (src >= trg && src <= trg + ofst) || (src <= trg && src >= trg - ofst);
  }

  setGuideLock(guide, value) {
    const axis = !isUndefined(guide.x) ? 'X' : 'Y';
    const trgName = `trg${axis}`;

    if (value !== null) {
      guide.active = 1;
      guide.lock = value;
      this[trgName] = guide;
    } else {
      delete guide.active;
      delete guide.lock;
      delete this[trgName];
    }

    return guide;
  }

  /**
   * Stop dragging
   */
  stop(ev, opts = {}) {
    const { delta } = this;
    const cancelled = opts.cancel;
    const x = cancelled ? 0 : delta.x;
    const y = cancelled ? 0 : delta.y;
    this.toggleDrag();
    this.lockedAxis = null;
    this.move(x, y, 1);
    const { onEnd } = this.opts;
    isFunction(onEnd) && onEnd(ev, this, { cancelled });
  }

  keyHandle(ev) {
    if (isEscKey(ev)) {
      this.stop(ev, { cancel: 1 });
    }
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
      end,
    };

    isFunction(setPosition) && setPosition(this.position);

    if (el) {
      el.style.left = `${xPos}px`;
      el.style.top = `${yPos}px`;
    }
  }

  getContainerEl() {
    const { container } = this.opts;
    return container ? [container] : this.getDocumentEl();
  }

  getWindowEl() {
    const cont = this.getContainerEl();
    return cont.map(item => {
      const doc = item.ownerDocument || item;
      return doc.defaultView || doc.parentWindow;
    });
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
    const pEv = getPointerEvent(ev);

    return getPos
      ? getPos(ev)
      : {
          x: pEv.clientX,
          y: pEv.clientY,
        };
  }

  getStartPosition() {
    const { el, opts } = this;
    const getPos = opts.getPosition;
    let result = resetPos();

    if (isFunction(getPos)) {
      result = getPos();
    } else if (el) {
      result = {
        x: parseFloat(el.style.left),
        y: parseFloat(el.style.top),
      };
    }

    return result;
  }

  getScrollInfo() {
    const { doc } = this.opts;
    const body = doc && doc.body;

    return {
      y: body ? body.scrollTop : 0,
      x: body ? body.scrollLeft : 0,
    };
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
