import { bindAll, each, isFunction } from 'underscore';
import { ElementPosOpts } from '../canvas/view/CanvasView';
import { Position } from '../common';
import { off, on } from './dom';
import { normalizeFloat } from './mixins';

type RectDim = {
  t: number;
  l: number;
  w: number;
  h: number;
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
  resizer: Resizer;
};

type Coordinate = Pick<RectDim, 't'|'l'>;

export interface ResizerOptions {
  /**
   * Function which returns custom X and Y coordinates of the mouse.
   */
  mousePosFetcher?: (ev: Event) => Position;

  /**
   * Indicates custom target updating strategy.
   */
  updateTarget?: (el: HTMLElement, rect: RectDim, opts: any) => void;

  /**
   * Function which gets HTMLElement as an arg and returns it relative position
   */
  posFetcher?: (el: HTMLElement, opts: any) => BoundingRect;

  /**
   * Indicate if the resizer should keep the default ratio.
   * @default false
   */
  ratioDefault?: boolean;

  /**
   * On resize start callback.
   */
  onStart?: (ev: Event, opts: CallbackOptions) => void;

  /**
   * On resize move callback.
   */
  onMove?: (ev: Event) => void;

  /**
   * On resize end callback.
   */
  onEnd?: (ev: Event, opts: CallbackOptions) => void;

  /**
   * On container update callback.
   */
  onUpdateContainer?: (opts: any) => void;

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
      hdl => (handlers[hdl] = opts[hdl] ? createHandler(hdl, opts) : null)
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
      each(frames, frame => (frame.style.pointerEvents = silent ? 'none' : ''));
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
    return [this.el!.ownerDocument, document];
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
   * Get any of the 8 handlers from the rectangle, 
   * and get it's coordinates based on zero degrees rotation.
   */
  private getRectCoordiante(handler: string, rect: RectDim): Coordinate {
    switch (handler) {
      case 'tl': return { t: rect.t, l: rect.l };
      case 'tr': return { t: rect.t, l: rect.l + rect.w };
      case 'bl': return { t: rect.t + rect.h, l: rect.l };
      case 'br': return { t: rect.t + rect.h, l: rect.l + rect.w };
      case 'tc': return { t: rect.t, l: rect.l + (rect.w / 2) };
      case 'cr': return { t: rect.t + (rect.h / 2), l: rect.l + rect.w };
      case 'bc': return { t: rect.t + rect.h, l: rect.l + (rect.w / 2) };
      case 'cl': return { t: rect.t + (rect.h / 2), l: rect.l };
      default: throw new Error('Invalid handler ' + handler);
    }
  } 

  /**
   * Get opposite coordinate on rectangle based on distance to center
   */
  private getOppositeRectCoordinate(coordinate: Coordinate, rect: RectDim): Coordinate {
    const cx = rect.l + (rect.w / 2);
    const cy = rect.t + (rect.h / 2);

    const dx = cx - coordinate.l;
    const dy = cy - coordinate.t;

    const nx = cx + dx;
    const ny = cy + dy;

    return { l: nx, t: ny }
  }

  /**
   * Rotate a rectangle coordinate around it's center and given rectangle rotation
   */
  private rotateCoordinate(coordinate: Coordinate, rect: RectDim): Coordinate {
    const cx = rect.l + (rect.w / 2);
    const cy = rect.t + (rect.h / 2);

    const a = ((rect.r));
    const theta = a * (Math.PI / 180);

    const x = coordinate.l;
    const y = coordinate.t;

    const rx = (x - cx) * Math.cos(theta) - (y - cy) * Math.sin(theta) + cx;
    const ry = (x - cx) * Math.sin(theta) + (y - cy) * Math.cos(theta) + cy;

    return { l: rx, t: ry }
  }

  /**
   * Start resizing
   * @param  {Event} e
   */
  start(ev: Event) {
    const e = ev as PointerEvent;
    // @ts-ignore Right or middel click
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const el = this.el!;
    const parentEl = this.getParentEl();
    const resizer = this;
    const config = this.opts || {};
    const mouseFetch = this.mousePosFetcher;
    const attrName = 'data-' + config.prefix + 'handler';
    const rect = this.getElementPos(el!, { avoidFrameZoom: true, avoidFrameOffset: true });
    const parentRect = this.getElementPos(parentEl!);
    const target = e.target as HTMLElement;
    const _rotation = getComputedStyle(el).rotate;
    const rotation = (Number((_rotation === 'none' ? '0deg' : _rotation).replace('deg', '')) + 360) % 360;

    this.handlerAttr = target.getAttribute(attrName)!;
    this.clickedHandler = target;

    this.startDim = {
      t: Number.parseFloat(el?.computedStyleMap().get('top')?.toString() ?? '0'),
      l: Number.parseFloat(el?.computedStyleMap().get('left')?.toString() ?? '0'),
      w: rect.width,
      h: rect.height,
      r: rotation
    };
    this.rectDim = {
      ...this.startDim,
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
      r: 0
    };

    // Listen events
    const docs = this.getDocumentEl();
    this.docs = docs;
    on(docs, 'pointermove', this.move);
    on(docs, 'keydown', this.handleKeyDown);
    on(docs, 'pointerup', this.stop);
    isFunction(this.onStart) && this.onStart(e, { docs, config, el, resizer });
    this.toggleFrames(true);
    this.move(e);
  }

  /**
   * While resizing
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

    // Calculate delta based on rotation and x,y shift
    const theta = (Math.PI / 180) * -this.startDim!.r;

    const sx = this.startPos!.x * Math.cos(theta) - this.startPos!.y * Math.sin(theta);
    const sy = this.startPos!.x * Math.sin(theta) + this.startPos!.y * Math.cos(theta);
    const cx = currentPos.x * Math.cos(theta) - currentPos.y * Math.sin(theta);
    const cy = currentPos.x * Math.sin(theta) + currentPos.y * Math.cos(theta);

    this.delta = {
      x: cx - sx,
      y: cy - sy
    };
    this.keys = {
      shift: e.shiftKey,
      ctrl: e.ctrlKey,
      alt: e.altKey,
    };

    this.rectDim = this.calc(this);
    this.updateRect(false);

    // Move callback
    onMove && onMove(e);
  }

  /**
   * Stop resizing
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
    isFunction(this.onEnd) && this.onEnd(e, { docs, config, el, resizer: this });
    delete this.docs;
  }

  /**
   * Update rect
   */
  updateRect(store: boolean) {
    const el = this.el!;
    const resizer = this;
    const config = this.opts;
    const rect = this.rectDim!;
    const updateTarget = this.updateTarget;
    const { unitHeight, unitWidth, keyWidth, keyHeight } = config;

    // Calculate difference between locking point after new dimensions
    const coordiantes = [this.startDim!, rect].map(rect => {
      const handlerCoordinate = this.getRectCoordiante(this.handlerAttr!, rect); 
      const oppositeCoordinate = this.getOppositeRectCoordinate(handlerCoordinate, rect);
      return this.rotateCoordinate(oppositeCoordinate, rect);
    })

    const diffX = coordiantes[0].l - coordiantes[1].l;
    const diffY = coordiantes[0].t - coordiantes[1].t;

    rect.t += diffY;
    rect.l += diffX;

    // Use custom updating strategy if requested
    if (isFunction(updateTarget)) {
      updateTarget(el, rect, {
        store,
        selectedHandler: this.handlerAttr,
        resizer,
        config,
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
   * Handle ESC key
   * @param  {Event} e
   */
  handleKeyDown(e: Event) {
    // @ts-ignore
    if (e.keyCode === 27) {
      // Rollback to initial dimensions
      this.rectDim = this.startDim;
      this.stop(e);
    }
  }

  /**
   * Handle mousedown to check if it's possible to start resizing
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
    const unitWidth = this.opts.unitWidth;
    const unitHeight = this.opts.unitHeight;
    const startW = unitWidth === '%' ? (startDim.w / 100) * parentW : startDim.w;
    const startH = unitHeight === '%' ? (startDim.h / 100) * parentH : startDim.h;
    const box: RectDim = {
      t: startDim.t,
      l: startDim.l,
      w: startW,
      h: startH,
      r: startDim.r
    };

    if (!data) return;

    var attr = data.handlerAttr!;
    if (~attr.indexOf('r')) {
      value =
        unitWidth === '%'
          ? normalizeFloat(((startW + deltaX * step) / parentW) * 100, 0.01)
          : normalizeFloat(startW + deltaX * step, step);
      value = Math.max(minDim, value);
      maxDim && (value = Math.min(maxDim, value));
      box.w = value;
    }
    if (~attr.indexOf('b')) {
      value =
        unitHeight === '%'
          ? normalizeFloat(((startH + deltaY * step) / parentH) * 100, 0.01)
          : normalizeFloat(startH + deltaY * step, step);
      value = Math.max(minDim, value);
      maxDim && (value = Math.min(maxDim, value));
      box.h = value;
    }
    if (~attr.indexOf('l')) {
      value =
        unitWidth === '%'
          ? normalizeFloat(((startW - deltaX * step) / parentW) * 100, 0.01)
          : normalizeFloat(startW - deltaX * step, step);
      value = Math.max(minDim, value);
      maxDim && (value = Math.min(maxDim, value));
      box.w = value;
    }
    if (~attr.indexOf('t')) {
      value =
        unitHeight === '%'
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

    for (const key in box) {
      const i = key as keyof RectDim;
      box[i] = parseInt(`${box[i]}`, 10);
    }

    return box;
  }
}
