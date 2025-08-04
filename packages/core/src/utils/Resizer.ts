import { bindAll, each, isFunction } from 'underscore';
import { ElementPosOpts } from '../canvas/view/CanvasView';
import { Position } from '../common';
import { off, on } from './dom';
import { normalizeFloat } from './mixins';

export type RectDim = {
  t: number;
  l: number;
  w: number;
  h: number;
};

type BoundingRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type CallbackOptions = {
  docs: Document[];
  config: ResizerOptions;
  el: HTMLElement;
  resizer: Resizer;
};

interface ResizerUpdateTargetOptions {
  store: boolean;
  selectedHandler?: string;
  resizer: Resizer;
  config: ResizerOptions;
  event: PointerEvent;
}

interface ResizerOnUpdateContainerOptions {
  el: HTMLElement;
  resizer: Resizer;
  opts: ResizerOptions;
}

export interface ResizerOptions {
  /**
   * Function which returns custom X and Y coordinates of the mouse.
   */
  mousePosFetcher?: (ev: Event) => Position;

  /**
   * Indicates custom target updating strategy.
   */
  updateTarget?: (el: HTMLElement, rect: RectDim, opts: ResizerUpdateTargetOptions) => void;

  /**
   * Function which gets HTMLElement as an arg and returns it relative position
   */
  posFetcher?: (el: HTMLElement, opts: ElementPosOpts) => BoundingRect;

  /**
   * Indicate if the resizer should keep the default ratio.
   * @default false
   */
  ratioDefault?: boolean;

  /**
   * On resize start callback.
   */
  onStart?: (ev: PointerEvent, opts: CallbackOptions) => void;

  /**
   * On resize move callback.
   */
  onMove?: (ev: PointerEvent, opts: CallbackOptions) => void;

  /**
   * On resize end callback.
   */
  onEnd?: (ev: PointerEvent, opts: CallbackOptions) => void;

  /**
   * On container update callback.
   */
  onUpdateContainer?: (opts: ResizerOnUpdateContainerOptions) => void;

  /**
   * Resize unit step.
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
   * Unit used for height resizing.
   * @default 'px'
   */
  unitHeight?: string;

  /**
   * Unit used for width resizing.
   * @default 'px'
   */
  unitWidth?: string;

  /**
   * The key used for height resizing.
   * @default 'height'
   */
  keyHeight?: string;

  /**
   * The key used for width resizing.
   * @default 'width'
   */
  keyWidth?: string;

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
   * If height is 'auto', this setting will preserve it and only update the width.
   * @default false
   */
  keepAutoHeight?: boolean;

  /**
   * If width is 'auto', this setting will preserve it and only update the height.
   * @default false
   */
  keepAutoWidth?: boolean;

  /**
   * When keepAutoHeight is true and the height has the value 'auto', this is set to true and height isn't updated.
   * @default false
   */
  autoHeight?: boolean;

  /**
   * When keepAutoWidth is true and the width has the value 'auto', this is set to true and width isn't updated.
   * @default false
   */
  autoWidth?: boolean;

  /**
   * Enable top left handler.
   * @default true
   */
  tl?: boolean;

  /**
   * Enable top center handler.
   * @default true
   */
  tc?: boolean;

  /**
   * Enable top right handler.
   * @default true
   */
  tr?: boolean;

  /**
   * Enable center left handler.
   * @default true
   */
  cl?: boolean;

  /**
   * Enable center right handler.
   * @default true
   */
  cr?: boolean;

  /**
   * Enable bottom left handler.
   * @default true
   */
  bl?: boolean;

  /**
   * Enable bottom center handler.
   * @default true
   */
  bc?: boolean;

  /**
   * Enable bottom right handler.
   * @default true
   */
  br?: boolean;

  /**
   * Class prefix.
   */
  prefix?: string;

  /**
   * Where to append resize container (default body element).
   */
  appendTo?: HTMLElement;

  /**
   * When enabled, the resizer will emit updates only if the size of the element
   * changes during a drag operation.
   *
   * By default, the resizer triggers update callbacks even if the pointer
   * doesn’t move (e.g., on click or tap without dragging). Set this option to `true`
   * to suppress those "no-op" updates and emit only meaningful changes.
   *
   * @default false
   */
  updateOnMove?: boolean;

  /**
   * By default, the resizer will try to perform adjustments on some units (eg. %), with this option
   * you can skip this behavior.
   */
  skipUnitAdjustments?: boolean;

  docs?: Document[];
}

type Handlers = Record<string, HTMLElement | null>;

const createHandler = (name: string, opts: { prefix?: string } = {}) => {
  var pfx = opts.prefix || '';
  var el = document.createElement('i');
  el.className = pfx + 'resizer-h ' + pfx + 'resizer-h-' + name;
  el.setAttribute('data-' + pfx + 'handler', name);
  return el;
};

const getBoundingRect = (el: HTMLElement, win?: Window): BoundingRect => {
  var w = win || window;
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + w.pageXOffset,
    top: rect.top + w.pageYOffset,
    width: rect.width,
    height: rect.height,
  };
};

export default class Resizer {
  defOpts: ResizerOptions;
  opts: ResizerOptions;
  container?: HTMLElement;
  handlers?: Handlers;
  el?: HTMLElement;
  clickedHandler?: HTMLElement;
  selectedHandler?: HTMLElement;
  handlerAttr?: string;
  startDim?: RectDim;
  rectDim?: RectDim;
  parentDim?: RectDim;
  startPos?: Position;
  delta?: Position;
  currentPos?: Position;
  docs?: Document[];
  moved = false;
  keys?: { shift: boolean; ctrl: boolean; alt: boolean };
  mousePosFetcher?: ResizerOptions['mousePosFetcher'];
  updateTarget?: ResizerOptions['updateTarget'];
  posFetcher?: ResizerOptions['posFetcher'];
  onStart?: ResizerOptions['onStart'];
  onMove?: ResizerOptions['onMove'];
  onEnd?: ResizerOptions['onEnd'];
  onUpdateContainer?: ResizerOptions['onUpdateContainer'];

  /**
   * Init the Resizer with options
   * @param  {Object} options
   */
  constructor(opts: ResizerOptions = {}) {
    this.defOpts = {
      ratioDefault: false,
      onUpdateContainer: () => {},
      step: 1,
      minDim: 10,
      maxDim: Infinity,
      unitHeight: 'px',
      unitWidth: 'px',
      keyHeight: 'height',
      keyWidth: 'width',
      currentUnit: true,
      silentFrames: false,
      avoidContainerUpdate: false,
      keepAutoHeight: false,
      keepAutoWidth: false,
      autoHeight: false,
      autoWidth: false,
      tl: true,
      tc: true,
      tr: true,
      cl: true,
      cr: true,
      bl: true,
      bc: true,
      br: true,
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
  setOptions(options: Partial<ResizerOptions> = {}, reset?: boolean) {
    this.opts = {
      ...(reset ? this.defOpts : this.opts),
      ...options,
    };
    this.setup();
  }

  /**
   * Setup resizer
   */
  setup() {
    const opts = this.opts;
    const pfx = opts.prefix || '';
    const appendTo = opts.appendTo || document.body;
    let container = this.container;

    // Create container if not yet exist
    if (!container) {
      container = document.createElement('div');
      container.className = `${pfx}resizer-c`;
      appendTo.appendChild(container);
      this.container = container;
    }

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Create handlers
    const handlers: Handlers = {};
    ['tl', 'tc', 'tr', 'cl', 'cr', 'bl', 'bc', 'br'].forEach(
      // @ts-ignore
      (hdl) => (handlers[hdl] = opts[hdl] ? createHandler(hdl, opts) : null),
    );

    for (let n in handlers) {
      const handler = handlers[n];
      handler && container.appendChild(handler);
    }

    this.handlers = handlers;
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
      each(frames, (frame) => (frame.style.pointerEvents = silent ? 'none' : ''));
    }
  }

  /**
   * Detects if the passed element is a resize handler
   * @param  {HTMLElement} el
   * @return {Boolean}
   */
  isHandler(el: HTMLElement) {
    const { handlers } = this;

    for (var n in handlers) {
      if (handlers[n] === el) return true;
    }

    return false;
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
    return this.opts.docs || [this.el!.ownerDocument, document];
  }

  /**
   * Return element position
   * @param  {HTMLElement} el
   * @param  {Object} opts Custom options
   * @return {Object}
   */
  getElementPos(el: HTMLElement, opts: ElementPosOpts = {}) {
    const { posFetcher } = this;
    return posFetcher ? posFetcher(el, opts) : getBoundingRect(el);
  }

  /**
   * Focus resizer on the element, attaches handlers to it
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
   * Start resizing
   * @param  {Event} e
   */
  start(e: PointerEvent) {
    const { el, opts = {} } = this;
    this.moved = false;

    if (e.button !== 0 || !el) return;

    e.preventDefault();
    e.stopPropagation();
    this.selectedHandler?.setPointerCapture(e.pointerId);
    const parentEl = this.getParentEl();
    const resizer = this;
    const config = opts;
    const mouseFetch = this.mousePosFetcher;
    const attrName = 'data-' + config.prefix + 'handler';
    const rect = this.getElementPos(el, { avoidFrameZoom: true, avoidFrameOffset: true });
    const parentRect = this.getElementPos(parentEl!);
    const target = e.target as HTMLElement;
    this.handlerAttr = target.getAttribute(attrName)!;
    this.clickedHandler = target;
    this.startDim = {
      t: rect.top,
      l: rect.left,
      w: rect.width,
      h: rect.height,
    };
    this.rectDim = {
      t: rect.top,
      l: rect.left,
      w: rect.width,
      h: rect.height,
    };
    this.startPos = mouseFetch
      ? mouseFetch(e)
      : {
          x: e.clientX,
          y: e.clientY,
        };
    this.parentDim = {
      t: parentRect.top,
      l: parentRect.left,
      w: parentRect.width,
      h: parentRect.height,
    };

    // Listen events
    const docs = this.getDocumentEl();
    this.docs = docs;
    on(docs, 'pointermove', this.move);
    on(docs, 'keydown', this.handleKeyDown);
    on(docs, 'pointerup', this.stop);
    isFunction(this.onStart) && this.onStart(e, { docs, config, el, resizer });
    this.toggleFrames(true);
    !config.updateOnMove && this.move(e);
  }

  /**
   * While resizing
   * @param  {Event} e
   */
  move(ev: PointerEvent) {
    this.moved = true;
    const el = this.el!;
    const config = this.opts;
    const docs = this.docs || this.getDocumentEl();
    const currentPos = this.mousePosFetcher?.(ev) || {
      x: ev.clientX,
      y: ev.clientY,
    };
    this.currentPos = currentPos;
    this.delta = {
      x: currentPos.x - this.startPos!.x,
      y: currentPos.y - this.startPos!.y,
    };
    this.keys = {
      shift: ev.shiftKey,
      ctrl: ev.ctrlKey,
      alt: ev.altKey,
    };
    this.rectDim = this.calc(this);
    this.updateRect(false, ev);
    this.onMove?.(ev, { docs, config, el, resizer: this });
  }

  /**
   * Stop resizing
   * @param  {Event} ev
   */
  stop(ev: PointerEvent) {
    const el = this.el!;
    const config = this.opts;
    const docs = this.docs || this.getDocumentEl();
    off(docs, 'pointermove', this.move);
    off(docs, 'keydown', this.handleKeyDown);
    off(docs, 'pointerup', this.stop);

    if (this.moved || !config.updateOnMove) {
      this.updateRect(true, ev);
    }

    ev.pointerId && this.selectedHandler?.releasePointerCapture(ev.pointerId);
    this.toggleFrames();
    this.onEnd?.(ev, { docs, config, el, resizer: this });
    this.moved = false;
    delete this.docs;
  }

  /**
   * Update rect
   */
  updateRect(store: boolean, event: PointerEvent) {
    const el = this.el!;
    const resizer = this;
    const config = this.opts;
    const rect = this.rectDim!;
    const updateTarget = this.updateTarget;
    const selectedHandler = this.getSelectedHandler();
    const { unitHeight, unitWidth, keyWidth, keyHeight } = config;

    // Use custom updating strategy if requested
    if (isFunction(updateTarget)) {
      updateTarget(el, rect, {
        store,
        selectedHandler,
        resizer,
        config,
        event,
      });
    } else {
      const elStyle = el.style as Record<string, any>;
      elStyle[keyWidth!] = rect.w + unitWidth!;
      elStyle[keyHeight!] = rect.h + unitHeight!;
    }

    this.updateContainer();
  }

  updateContainer(opt: { forceShow?: boolean } = {}) {
    const { opts, container, el } = this;
    const { style } = container!;

    if (!opts.avoidContainerUpdate && el) {
      // On component resize container fits the tool,
      // to check if this update is required somewhere else point
      // const toUpdate = ['left', 'top', 'width', 'height'];
      // const rectEl = this.getElementPos(el, { target: 'container' });
      // toUpdate.forEach(pos => (style[pos] = `${rectEl[pos]}px`));
      if (opt.forceShow) style.display = 'block';
    }

    this.onUpdateContainer?.({
      el: container!,
      resizer: this,
      opts: {
        ...opts,
        ...opt,
      },
    });
  }

  /**
   * Get selected handler name
   * @return {string}
   */
  getSelectedHandler() {
    var handlers = this.handlers;

    if (!this.selectedHandler) {
      return;
    }

    for (let n in handlers) {
      if (handlers[n] === this.selectedHandler) return n;
    }
  }

  /**
   * Handle ESC key
   * @param  {Event} e
   */
  handleKeyDown(e: PointerEvent) {
    // @ts-ignore
    if (e.keyCode === 27) {
      // Rollback to initial dimensions
      this.rectDim = this.startDim;
      this.stop(e);
    }
  }

  /**
   * Handle mousedown to check if it's possible to start resizing
   */
  handleMouseDown(e: PointerEvent) {
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
  calc(data: Resizer): RectDim | undefined {
    let value;
    const opts = this.opts || {};
    const step = opts.step!;
    const startDim = this.startDim!;
    const minDim = opts.minDim!;
    const maxDim = opts.maxDim;
    const deltaX = data.delta!.x;
    const deltaY = data.delta!.y;
    const parentW = this.parentDim!.w;
    const parentH = this.parentDim!.h;
    const { unitWidth, unitHeight, skipUnitAdjustments } = opts;
    const parentRect = this.getParentRect();
    const isWidthPercent = unitWidth === '%' && !skipUnitAdjustments;
    const isHeightPercent = unitHeight === '%' && !skipUnitAdjustments;
    const startW = isWidthPercent ? (startDim.w / 100) * parentW : startDim.w;
    const startH = isHeightPercent ? (startDim.h / 100) * parentH : startDim.h;

    const box: RectDim = {
      t: startDim.t - parentRect.top,
      l: startDim.l - parentRect.left,
      w: startW,
      h: startH,
    };

    if (!data) return;

    var attr = data.handlerAttr!;
    if (~attr.indexOf('r')) {
      value = isWidthPercent
        ? normalizeFloat(((startW + deltaX * step) / parentW) * 100, 0.01)
        : normalizeFloat(startW + deltaX * step, step);
      value = Math.max(minDim, value);
      maxDim && (value = Math.min(maxDim, value));
      box.w = value;
    }
    if (~attr.indexOf('b')) {
      value = isHeightPercent
        ? normalizeFloat(((startH + deltaY * step) / parentH) * 100, 0.01)
        : normalizeFloat(startH + deltaY * step, step);
      value = Math.max(minDim, value);
      maxDim && (value = Math.min(maxDim, value));
      box.h = value;
    }
    if (~attr.indexOf('l')) {
      value = isWidthPercent
        ? normalizeFloat(((startW - deltaX * step) / parentW) * 100, 0.01)
        : normalizeFloat(startW - deltaX * step, step);
      value = Math.max(minDim, value);
      maxDim && (value = Math.min(maxDim, value));
      box.w = value;
    }
    if (~attr.indexOf('t')) {
      value = isHeightPercent
        ? normalizeFloat(((startH - deltaY * step) / parentH) * 100, 0.01)
        : normalizeFloat(startH - deltaY * step, step);
      value = Math.max(minDim, value);
      maxDim && (value = Math.min(maxDim, value));
      box.h = value;
    }

    // Enforce aspect ratio (unless shift key is being held)
    var ratioActive = opts.ratioDefault ? !data.keys!.shift : data.keys!.shift;
    if (attr.indexOf('c') < 0 && ratioActive) {
      var ratio = startDim.w / startDim.h;
      if (box.w / box.h > ratio) {
        box.h = Math.round(box.w / ratio);
      } else {
        box.w = Math.round(box.h * ratio);
      }
    }

    if (~attr.indexOf('l')) {
      box.l += startDim.w - box.w;
    }
    if (~attr.indexOf('t')) {
      box.t += startDim.h - box.h;
    }

    for (const key in box) {
      const i = key as keyof RectDim;
      box[i] = parseInt(`${box[i]}`, 10);
    }

    return box;
  }

  getParentRect(): BoundingRect {
    let parentRect = { left: 0, top: 0, width: 0, height: 0 };
    const { el } = this;

    if (!el) return parentRect;

    const { offsetParent } = el;

    // Check if the parent or any ancestor has `position: relative`, `absolute`, `fixed`, or `sticky`
    if (offsetParent && offsetParent.tagName !== 'BODY') {
      parentRect = this.getElementPos(offsetParent as HTMLElement);
    }

    return parentRect;
  }
}
