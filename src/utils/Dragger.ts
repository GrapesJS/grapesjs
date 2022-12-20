import { bindAll, isFunction, result, isUndefined } from 'underscore';
import { on, off, isEscKey, getPointerEvent } from './mixins';

type Position = {
  x: number;
  y: number;
  end?: boolean;
};

type PositionXY = keyof Omit<Position, 'end'>;

type Guide = {
  x: number;
  y: number;
  lock?: number;
  active?: boolean;
};

interface DraggerOptions {
  /**
   * Element on which the drag will be executed. By default, the document will be used
   */
  container?: HTMLElement;

  /**
   * Callback on drag start.
   * @example
   * onStart(ev, dragger) {
   *  console.log('pointer start', dragger.startPointer, 'position start', dragger.startPosition);
   * }
   */
  onStart?: (ev: Event, dragger: Dragger) => void;

  /**
   * Callback on drag.
   * @example
   * onDrag(ev, dragger) {
   *  console.log('pointer', dragger.currentPointer, 'position', dragger.position, 'delta', dragger.delta);
   * }
   */
  onDrag?: (ev: Event, dragger: Dragger) => void;

  /**
   * Callback on drag end.
   * @example
   * onEnd(ev, dragger) {
   *   console.log('pointer', dragger.currentPointer, 'position', dragger.position, 'delta', dragger.delta);
   * }
   */
  onEnd?: (ev: Event, dragger: Dragger, opts: { cancelled: boolean }) => void;

  /**
   * Indicate a callback where to pass an object with new coordinates
   */
  setPosition?: (position: Position) => void;

  /**
   * Indicate a callback where to get initial coordinates.
   * @example
   * getPosition: () => {
   *   // ...
   *   return { x: 10, y: 100 }
   * }
   */
  getPosition?: () => Position;

  /**
   * Indicate a callback where to get pointer coordinates.
   */
  getPointerPosition?: (ev: Event) => Position;

  /**
   * Static guides to be snapped.
   */
  guidesStatic?: () => Guide[];

  /**
   * Target guides that will snap to static one.
   */
  guidesTarget?: () => Guide[];

  /**
   * Offset before snap to guides.
   * @default 5
   */
  snapOffset?: number;

  /**
   * Document on which listen to pointer events.
   */
  doc?: Document;

  /**
   * Scale result points, can also be a function.
   * @default 1
   */
  scale?: number | (() => number);
}

const resetPos = () => ({ x: 0, y: 0 });

const xyArr: PositionXY[] = ['x', 'y'];

export default class Dragger {
  opts: DraggerOptions;
  startPointer: Position;
  delta: Position;
  lastScroll: Position;
  lastScrollDiff: Position;
  startPosition: Position;
  globScrollDiff: Position;
  currentPointer: Position;
  position: Position;
  el?: HTMLElement;
  guidesStatic: Guide[];
  guidesTarget: Guide[];
  lockedAxis?: any;
  docs: Document[];
  trgX?: Guide;
  trgY?: Guide;

  /**
   * Init the dragger
   * @param  {Object} opts
   */
  constructor(opts: DraggerOptions = {}) {
    this.opts = {
      snapOffset: 5,
      scale: 1,
    };
    bindAll(this, 'drag', 'stop', 'keyHandle', 'handleScroll');
    this.setOptions(opts);
    this.delta = resetPos();
    this.lastScroll = resetPos();
    this.lastScrollDiff = resetPos();
    this.startPointer = resetPos();
    this.startPosition = resetPos();
    this.globScrollDiff = resetPos();
    this.currentPointer = resetPos();
    this.position = resetPos();
    this.guidesStatic = [];
    this.guidesTarget = [];
    this.docs = [];
    return this;
  }

  /**
   * Update options
   * @param {Object} options
   */
  setOptions(opts: Partial<DraggerOptions> = {}) {
    this.opts = {
      ...this.opts,
      ...opts,
    };
  }

  toggleDrag(enable?: boolean) {
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
      x: actualScroll.x - lastScroll!.x,
      y: actualScroll.y - lastScroll!.y,
    };
    this.move(delta.x + scrollDiff.x, delta.y + scrollDiff.y);
    this.lastScrollDiff = scrollDiff;
  }

  /**
   * Start dragging
   * @param  {Event} e
   */
  start(ev: Event) {
    const { opts } = this;
    const { onStart } = opts;
    this.toggleDrag(true);
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
  drag(ev: Event) {
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

    // @ts-ignore Lock one axis
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

    const moveDelta = (delta: Position) => {
      xyArr.forEach(co => (delta[co] = delta[co] * result(opts, 'scale')));
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

    // @ts-ignore In case the mouse button was released outside of the window
    ev.which === 0 && this.stop(ev);
  }

  /**
   * Check if the delta hits some guide
   */
  snapGuides(delta: Position) {
    const newDelta = delta;
    let { trgX, trgY } = this;

    this.guidesTarget.forEach(trg => {
      // Skip the guide if its locked axis already exists
      if ((trg.x && this.trgX) || (trg.y && this.trgY)) return;
      trg.active = false;

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

    xyArr.forEach(co => {
      const axis = co.toUpperCase();
      // @ts-ignore
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

  isPointIn(src: number, trg: number, { offset }: { offset?: number } = {}) {
    const ofst = offset || this.opts.snapOffset || 0;
    return (src >= trg && src <= trg + ofst) || (src <= trg && src >= trg - ofst);
  }

  setGuideLock(guide: Guide, value: any) {
    const axis = !isUndefined(guide.x) ? 'X' : 'Y';
    const trgName = `trg${axis}`;

    if (value !== null) {
      guide.active = true;
      guide.lock = value;
      // @ts-ignore
      this[trgName] = guide;
    } else {
      delete guide.active;
      delete guide.lock;
      // @ts-ignore
      delete this[trgName];
    }

    return guide;
  }

  /**
   * Stop dragging
   */
  stop(ev: Event, opts: { cancel?: boolean } = {}) {
    const { delta } = this;
    const cancelled = !!opts.cancel;
    const x = cancelled ? 0 : delta.x;
    const y = cancelled ? 0 : delta.y;
    this.toggleDrag();
    this.lockedAxis = null;
    this.move(x, y, true);
    const { onEnd } = this.opts;
    isFunction(onEnd) && onEnd(ev, this, { cancelled });
  }

  keyHandle(ev: Event) {
    if (isEscKey(ev as KeyboardEvent)) {
      this.stop(ev, { cancel: true });
    }
  }

  /**
   * Move the element
   * @param  {integer} x
   * @param  {integer} y
   */
  move(x: number, y: number, end?: boolean) {
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
      // @ts-ignore
      return doc.defaultView || doc.parentWindow;
    });
  }

  /**
   * Returns documents
   */
  getDocumentEl(el?: HTMLElement): Document[] {
    const { doc } = this.opts;
    el = el || this.el;

    if (!this.docs.length) {
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
  getPointerPos(ev: Event) {
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

  detectAxisLock(x: number, y: number) {
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
