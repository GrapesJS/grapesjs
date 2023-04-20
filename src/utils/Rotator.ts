import { bindAll, isFunction, each } from 'underscore';
import { Position } from '../common';
import { on, off, normalizeFloat } from './mixins';

type RectDim = {
  w: number;
  h: number;
  t: number;
  l: number;
  r: number;
};

type BoundingRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type CallbackOptions = {
  docs: any;
  config: any;
  el: HTMLElement;
  rotator: Rotator;
};

export interface RotatorOptions {
  /**
   * Function which returns custom X and Y coordinates of the mouse.
   */
  mousePosFetcher?: (ev: MouseEvent) => Position;

  /**
   * Indicates custom target updating strategy.
   */
  updateTarget?: (el: HTMLElement, rect: RectDim, opts: any) => void;

  /**
   * Function which gets HTMLElement as an arg and returns it relative position
   */
  posFetcher?: (el: HTMLElement, opts: any) => BoundingRect;

  /**
   * On rotate start callback.
   */
  onStart?: (ev: Event, opts: CallbackOptions) => void;

  /**
   * On rotate move callback.
   */
  onMove?: (ev: Event) => void;

  /**
   * On rotate end callback.
   */
  onEnd?: (ev: Event, opts: CallbackOptions) => void;

  /**
   * On container update callback.
   */
  onUpdateContainer?: (opts: any) => void;

  /**
   * Rotate unit step.
   * @default 1
   */
  step?: number;

  /**
   * Minimum dimension.
   * @default 10
   */
  minDim?: number;

  /**
   * Maximum dimension.
   * @default Infinity
   */
  maxDim?: number;

  /**
   * If true, will override unitHeight and unitWidth, on start, with units
   * from the current focused element (currently used only in SelectComponent).
   * @default true
   */
  currentUnit?: boolean;

  /**
   * With this option enabled the mousemove event won't be altered when the pointer comes over iframes.
   * @default false
   */
  silentFrames?: boolean;

  /**
   * If true the container of handlers won't be updated.
   * @default false
   */
  avoidContainerUpdate?: boolean;

  /**
   * Class prefix.
   */
  prefix?: string;

  /**
   * Where to append rotate container (default body element).
   */
  appendTo?: HTMLElement;

  /**
   * Offset before snap to guides.
   * @default 5
   */
  snapOffset?: number;

  /**
   * Offset before snap to guides.
   * @default 45
   */
  snapPoints?: number;
}

const getBoundingRect = (el: HTMLElement, win?: Window): BoundingRect => {
  var w = win || window;

  return {
    left: el.offsetLeft + w.pageXOffset,
    top: el.offsetTop + w.pageYOffset,
    width: el.offsetWidth,
    height: el.offsetHeight,
  };
};

export default class Rotator {
  defOpts: RotatorOptions;
  opts: RotatorOptions;
  container?: HTMLElement;
  handler?: HTMLElement;
  el?: HTMLElement;
  selectedHandler?: HTMLElement;
  handlerAttr?: string;
  center?: Position;
  startDim?: RectDim;
  rectDim?: RectDim;
  delta?: Position;
  startPos?: Position;
  currentPos?: Position;
  docs?: Document[];
  snapOffset?: number;
  snapPoints?: number;
  mousePosFetcher?: RotatorOptions['mousePosFetcher'];
  updateTarget?: RotatorOptions['updateTarget'];
  posFetcher?: RotatorOptions['posFetcher'];
  onStart?: RotatorOptions['onStart'];
  onMove?: RotatorOptions['onMove'];
  onEnd?: RotatorOptions['onEnd'];
  onUpdateContainer?: RotatorOptions['onUpdateContainer'];

  /**
   * Init the Rotator with options
   * @param  {Object} options
   */
  constructor(opts: RotatorOptions = {}) {
    this.defOpts = {
      onUpdateContainer: () => {},
      step: 1,
      minDim: 10,
      maxDim: Infinity,
      currentUnit: true,
      silentFrames: false,
      avoidContainerUpdate: false,
      snapOffset: 5,
      snapPoints: 45,
    };
    this.opts = { ...this.defOpts };
    this.setOptions(opts);
    bindAll(this, 'handleKeyDown', 'handleMouseDown', 'move', 'stop');
  }

  /**
   * Get current connfiguration options
   * @return {Object}
   */
  getConfig() {
    return this.opts;
  }

  /**
   * Setup options
   * @param {Object} options
   */
  setOptions(options: Partial<RotatorOptions> = {}, reset?: boolean) {
    this.opts = {
      ...(reset ? this.defOpts : this.opts),
      ...options,
    };
    this.setup();
  }

  /**
   * Setup rotator
   */
  setup() {
    const opts = this.opts;
    const pfx = opts.prefix || '';
    const appendTo = opts.appendTo || document.body;
    let container = this.container;

    // Create container if not yet exist
    if (!container) {
      container = document.createElement('div');
      container.className = `${pfx}rotator-c`;
      appendTo.appendChild(container);
      this.container = container;
    }

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    this.handler = container;
    this.mousePosFetcher = opts.mousePosFetcher;
    this.updateTarget = opts.updateTarget;
    this.posFetcher = opts.posFetcher;
    this.onStart = opts.onStart;
    this.onMove = opts.onMove;
    this.onEnd = opts.onEnd;
    this.onUpdateContainer = opts.onUpdateContainer;
  }

  /**
   * Toggle iframes pointer event
   * @param {Boolean} silent If true, iframes will be silented
   */
  toggleFrames(silent?: boolean) {
    if (this.opts.silentFrames) {
      const frames = document.querySelectorAll('iframe');
      each(frames, frame => (frame.style.pointerEvents = silent ? 'none' : ''));
    }
  }

  /**
   * Detects if the passed element is a rotate handler
   * @param  {HTMLElement} el
   * @return {Boolean}
   */
  isHandler(el: HTMLElement) {
    const { handler } = this;
    return handler === el;
  }

  /**
   * Returns the focused element
   * @return {HTMLElement}
   */
  getFocusedEl() {
    return this.el;
  }

  /**
   * Returns the parent of the focused element
   * @return {HTMLElement}
   */
  getParentEl() {
    return this.el?.parentElement;
  }

  /**
   * Returns documents
   */
  getDocumentEl() {
    return [this.el!.ownerDocument, document];
  }

  /**
   * Return element position
   * @param  {HTMLElement} el
   * @param  {Object} opts Custom options
   * @return {Object}
   */
  getElementPos(el: HTMLElement, opts = {}) {
    const { posFetcher } = this;
    return posFetcher ? posFetcher(el, opts) : getBoundingRect(el);
  }

  /**
   * Return element rotation
   * @param   {HTMLElement} el
   * @returns {number} rotation
   */
  getElementRotation(el: HTMLElement): number {
    var rotation = window.getComputedStyle(el, null).getPropertyValue('rotate') ?? null;
    return rotation ? Number(rotation.replace('deg', '')) : 0;
  }

  /**
   * Focus rotator on the element, attaches handlers to it
   * @param {HTMLElement} el
   */
  focus(el: HTMLElement) {
    // Avoid focusing on already focused element
    if (el && el === this.el) {
      return;
    }

    this.el = el;
    this.updateContainer({ forceShow: true });
    on(this.getDocumentEl(), 'pointerdown', this.handleMouseDown);
  }

  /**
   * Blur from element
   */
  blur() {
    this.container!.style.display = 'none';

    if (this.el) {
      off(this.getDocumentEl(), 'pointerdown', this.handleMouseDown);
      delete this.el;
    }
  }

  /**
   * Start rotating
   * @param  {Event} e
   */
  start(ev: Event) {
    const e = ev as PointerEvent;
    // @ts-ignore Right or middel click
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const el = this.el!;
    const rotator = this;
    const config = this.opts || {};
    const attrName = 'data-' + config.prefix + 'handler';
    const rectRotation = this.getElementRotation(el!);
    const rect = this.getElementPos(el!, { avoidFrameZoom: true, });
    const target = e.target as HTMLElement;
    this.handlerAttr = target.getAttribute(attrName)!;

    const mouseFetch = this.mousePosFetcher;
    this.startPos = mouseFetch
      ? mouseFetch(e)
      : {
          x: e.clientX,
          y: e.clientY,
        };

    this.startDim = {
      t: rect.top,
      l: rect.left,
      w: rect.width,
      h: rect.height,
      r: rectRotation,
    };
    this.rectDim = {
      t: rect.top,
      l: rect.left,
      w: rect.width,
      h: rect.height,
      r: rectRotation,
    };

    const dims = this.getElementPos(el!, { avoidFrameZoom: true, avoidFrameOffset: true });
    this.center = {
      x: dims.left + (dims.width / 2),
      y: dims.top + (dims.height / 2),
    };

    // Listen events
    const docs = this.getDocumentEl();
    this.docs = docs;
    on(docs, 'pointermove', this.move);
    on(docs, 'keydown', this.handleKeyDown);
    on(docs, 'pointerup', this.stop);
    isFunction(this.onStart) && this.onStart(e, { docs, config, el, rotator });
    this.toggleFrames(true);
    this.move(e);
  }

  /**
   * While rotating
   * @param  {Event} e
   */
  move(ev: PointerEvent | Event) {
    const e = ev as PointerEvent;
    const onMove = this.onMove;
    const mouseFetch = this.mousePosFetcher;
    const currentPos = mouseFetch
      ? mouseFetch(e)
      : {
          x: e.clientX,
          y: e.clientY,
        };
    this.currentPos = currentPos;

    const dX = this.startPos!.x - this.center!.x;
    const dY = this.startPos!.y - this.center!.y;
    const R = Math.sqrt(dX * dX + dY * dY);

    const vX = currentPos.x - this.center!.x;
    const vY = currentPos.y - this.center!.y;
    const magV = Math.sqrt(vX * vX + vY * vY);
    const aX = this.center!.x + vX / magV * R;
    const aY = this.center!.y + vY / magV * R;

    this.delta = {
      x: aX - this.center!.x,
      y: aY - this.center!.y,
    };

    this.rectDim = this.calc(this);
    this.updateRect(false);

    // Move callback
    onMove && onMove(e);
  }

  /**
   * Stop rotating
   * @param  {Event} e
   */
  stop(e: Event) {
    const el = this.el!;
    const config = this.opts;
    const docs = this.docs || this.getDocumentEl();
    off(docs, 'pointermove', this.move);
    off(docs, 'keydown', this.handleKeyDown);
    off(docs, 'pointerup', this.stop);
    this.updateRect(true);
    this.toggleFrames();
    isFunction(this.onEnd) && this.onEnd(e, { docs, config, el, rotator: this });
    delete this.docs;
  }

  /**
   * Update rect
   */
  updateRect(store: boolean) {
    const el = this.el!;
    const rotator = this;
    const config = this.opts;
    const rect = this.rectDim!;
    const updateTarget = this.updateTarget;

    // Use custom updating strategy if requested
    if (isFunction(updateTarget)) {
      updateTarget(el, rect, {
        store,
        rotator,
        config,
      });
    } else {
      const elStyle = el.style as Record<string, any>;
      elStyle.rotate = rect.r + 'deg';
    }

    this.updateContainer();
  }

  updateContainer(opt: { forceShow?: boolean } = {}) {
    const { opts, container, el } = this;
    const { style } = container!;

    if (!opts.avoidContainerUpdate && el) {
      // On component rotate container fits the tool,
      // to check if this update is required somewhere else point
      // const toUpdate = ['rotate'];
      // const rectEl = this.getElementPos(el, { target: 'container' });
      // toUpdate.forEach(pos => (style[pos] = `${rectEl[pos]}px`));
      if (opt.forceShow) style.display = 'block';
    }

    this.onUpdateContainer?.({
      el: container!,
      rotator: this,
      opts: {
        ...opts,
        ...opt,
      },
    });
  }

  /**
   * Handle ESC key
   * @param  {Event} e
   */
  handleKeyDown(e: Event) {
    // @ts-ignore
    if (e.keyCode === 27) {
      // Rollback to initial rotation
      this.rectDim = this.startDim;
      this.stop(e);
    }
  }

  /**
   * Handle mousedown to check if it's possible to start rotating
   * @param  {Event} e
   */
  handleMouseDown(e: Event) {
    const el = e.target as HTMLElement;
    if (this.isHandler(el)) {
      this.selectedHandler = el;
      this.start(e);
    } else if (el !== this.el) {
      delete this.selectedHandler;
      this.blur();
    }
  }

  /**
   * All positioning logic
   * @return {Object}
   */
  calc(data: Rotator): RectDim | undefined {
    const startDim = this.startDim!;
    const deltaX = data.delta!.x;
    const deltaY = data.delta!.y;
    const box: RectDim = {
      l: startDim.l,
      t: startDim.t,
      w: startDim.w,
      h: startDim.h,
      r: startDim.r,
    };

    if (!data) return;

    const angle = (Math.atan2(deltaY, deltaX) * 180 / Math.PI) + 90;
    
    box.r = angle;

    const snappingPoints = this.defOpts.snapPoints!;
    const snappingOffset = this.defOpts.snapOffset!;

    const prevSnappingPoint = Math.round(angle / snappingPoints) * snappingPoints;
    const nextSnappingPoint = prevSnappingPoint + snappingPoints;
    const closestSnappingPoint =
      angle - prevSnappingPoint > nextSnappingPoint - angle ? nextSnappingPoint : prevSnappingPoint;

    const isWithinSnapRange = Math.abs(angle - closestSnappingPoint) < snappingOffset;

    // Override the rotation when the element is supposed to snap
    box.r = isWithinSnapRange ? closestSnappingPoint : box.r;

    return box;
  }
}
