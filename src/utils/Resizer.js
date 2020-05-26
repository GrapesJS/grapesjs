import { bindAll, defaults, isFunction, each } from 'underscore';
import { on, off, normalizeFloat } from 'utils/mixins';

var defaultOpts = {
  // Function which returns custom X and Y coordinates of the mouse
  mousePosFetcher: null,
  // Indicates custom target updating strategy
  updateTarget: null,
  // Function which gets HTMLElement as an arg and returns it relative position
  ratioDefault: 0,
  posFetcher: null,
  onStart: null,
  onMove: null,
  onEnd: null,
  onUpdateContainer: () => {},

  // Resize unit step
  step: 1,

  // Minimum dimension
  minDim: 32,

  // Maximum dimension
  maxDim: '',

  // Unit used for height resizing
  unitHeight: 'px',

  // Unit used for width resizing
  unitWidth: 'px',

  // The key used for height resizing
  keyHeight: 'height',

  // The key used for width resizing
  keyWidth: 'width',

  // If true, will override unitHeight and unitWidth, on start, with units
  // from the current focused element (currently used only in SelectComponent)
  currentUnit: 1,

  // With this option active the mousemove event won't be altered when
  // the pointer comes over iframes
  silentFrames: 0,

  // If true the container of handlers won't be updated
  avoidContainerUpdate: 0,

  // If height is 'auto', this setting will preserve it and only update  width
  keepAutoHeight: false,

  // If width is 'auto', this setting will preserve it and only update height
  keepAutoWidth: false,

  // When keepAutoHeight is true and the height has the value 'auto', this is set to true and height isn't updated
  autoHeight: false,

  // When keepAutoWidth is true and the width has the value 'auto', this is set to true and width isn't updated
  autoWidth: false,

  // Handlers
  tl: 1, // Top left
  tc: 1, // Top center
  tr: 1, // Top right
  cl: 1, // Center left
  cr: 1, // Center right
  bl: 1, // Bottom left
  bc: 1, // Bottom center
  br: 1 // Bottom right
};

var createHandler = (name, opts) => {
  var pfx = opts.prefix || '';
  var el = document.createElement('i');
  el.className = pfx + 'resizer-h ' + pfx + 'resizer-h-' + name;
  el.setAttribute('data-' + pfx + 'handler', name);
  return el;
};

var getBoundingRect = (el, win) => {
  var w = win || window;
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + w.pageXOffset,
    top: rect.top + w.pageYOffset,
    width: rect.width,
    height: rect.height
  };
};

class Resizer {
  /**
   * Init the Resizer with options
   * @param  {Object} options
   */
  constructor(opts = {}) {
    this.setOptions(opts);
    bindAll(this, 'handleKeyDown', 'handleMouseDown', 'move', 'stop');
    return this;
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
  setOptions(options = {}) {
    this.opts = defaults(options, defaultOpts);
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
    const handlers = {};
    ['tl', 'tc', 'tr', 'cl', 'cr', 'bl', 'bc', 'br'].forEach(
      hdl => (handlers[hdl] = opts[hdl] ? createHandler(hdl, opts) : '')
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
  toggleFrames(silent) {
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
  isHandler(el) {
    var handlers = this.handlers;

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
   * Returns documents
   */
  getDocumentEl() {
    return [this.el.ownerDocument, document];
  }

  /**
   * Return element position
   * @param  {HTMLElement} el
   * @param  {Object} opts Custom options
   * @return {Object}
   */
  getElementPos(el, opts = {}) {
    var posFetcher = this.posFetcher || '';
    return posFetcher ? posFetcher(el, opts) : getBoundingRect(el);
  }

  /**
   * Focus resizer on the element, attaches handlers to it
   * @param {HTMLElement} el
   */
  focus(el) {
    // Avoid focusing on already focused element
    if (el && el === this.el) {
      return;
    }

    this.el = el;
    this.updateContainer({ forceShow: 1 });
    on(this.getDocumentEl(), 'mousedown', this.handleMouseDown);
  }

  /**
   * Blur from element
   */
  blur() {
    this.container.style.display = 'none';

    if (this.el) {
      off(this.getDocumentEl(), 'mousedown', this.handleMouseDown);
      this.el = null;
    }
  }

  /**
   * Start resizing
   * @param  {Event} e
   */
  start(e) {
    //Right or middel click
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const el = this.el;
    const resizer = this;
    const config = this.opts || {};
    var attrName = 'data-' + config.prefix + 'handler';
    var rect = this.getElementPos(el, { target: 'el' });
    this.handlerAttr = e.target.getAttribute(attrName);
    this.clickedHandler = e.target;
    this.startDim = {
      t: rect.top,
      l: rect.left,
      w: rect.width,
      h: rect.height
    };
    this.rectDim = {
      t: rect.top,
      l: rect.left,
      w: rect.width,
      h: rect.height
    };
    this.startPos = {
      x: e.clientX,
      y: e.clientY
    };

    // Listen events
    var doc = this.getDocumentEl();
    on(doc, 'mousemove', this.move);
    on(doc, 'keydown', this.handleKeyDown);
    on(doc, 'mouseup', this.stop);
    isFunction(this.onStart) &&
      this.onStart(e, { docs: doc, config, el, resizer });
    this.toggleFrames(1);
    this.move(e);
  }

  /**
   * While resizing
   * @param  {Event} e
   */
  move(e) {
    const onMove = this.onMove;
    var mouseFetch = this.mousePosFetcher;
    var currentPos = mouseFetch
      ? mouseFetch(e)
      : {
          x: e.clientX,
          y: e.clientY
        };

    this.currentPos = currentPos;
    this.delta = {
      x: currentPos.x - this.startPos.x,
      y: currentPos.y - this.startPos.y
    };
    this.keys = {
      shift: e.shiftKey,
      ctrl: e.ctrlKey,
      alt: e.altKey
    };

    this.rectDim = this.calc(this);
    this.updateRect(0);

    // Move callback
    onMove && onMove(e);

    // In case the mouse button was released outside of the window
    if (e.which === 0) {
      this.stop(e);
    }
  }

  /**
   * Stop resizing
   * @param  {Event} e
   */
  stop(e) {
    const config = this.opts;
    var doc = this.getDocumentEl();
    off(doc, 'mousemove', this.move);
    off(doc, 'keydown', this.handleKeyDown);
    off(doc, 'mouseup', this.stop);
    this.updateRect(1);
    this.toggleFrames();
    isFunction(this.onEnd) && this.onEnd(e, { docs: doc, config });
  }

  /**
   * Update rect
   */
  updateRect(store) {
    const el = this.el;
    const resizer = this;
    const config = this.opts;
    const rect = this.rectDim;
    const updateTarget = this.updateTarget;
    const selectedHandler = this.getSelectedHandler();
    const { unitHeight, unitWidth, keyWidth, keyHeight } = config;

    // Use custom updating strategy if requested
    if (isFunction(updateTarget)) {
      updateTarget(el, rect, {
        store,
        selectedHandler,
        resizer,
        config
      });
    } else {
      const elStyle = el.style;
      elStyle[keyWidth] = rect.w + unitWidth;
      elStyle[keyHeight] = rect.h + unitHeight;
    }

    this.updateContainer();
  }

  updateContainer(opt = {}) {
    const { opts, container, el } = this;
    const { style } = container;

    if (!opts.avoidContainerUpdate && el) {
      // On component resize container fits the tool,
      // to check if this update is required somewhere else point
      // const toUpdate = ['left', 'top', 'width', 'height'];
      // const rectEl = this.getElementPos(el, { target: 'container' });
      // toUpdate.forEach(pos => (style[pos] = `${rectEl[pos]}px`));
      if (opt.forceShow) style.display = 'block';
    }

    this.onUpdateContainer({
      el: container,
      resizer: this,
      opts: {
        ...opts,
        ...opt
      }
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
  handleKeyDown(e) {
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
  handleMouseDown(e) {
    var el = e.target;
    if (this.isHandler(el)) {
      this.selectedHandler = el;
      this.start(e);
    } else if (el !== this.el) {
      this.selectedHandler = '';
      this.blur();
    }
  }

  /**
   * All positioning logic
   * @return {Object}
   */
  calc(data) {
    let value;
    const opts = this.opts || {};
    const step = opts.step;
    const startDim = this.startDim;
    const minDim = opts.minDim;
    const maxDim = opts.maxDim;
    const deltaX = data.delta.x;
    const deltaY = data.delta.y;
    const startW = startDim.w;
    const startH = startDim.h;
    var box = {
      t: 0,
      l: 0,
      w: startW,
      h: startH
    };

    if (!data) return;

    var attr = data.handlerAttr;
    if (~attr.indexOf('r')) {
      value = normalizeFloat(startW + deltaX * step, step);
      value = Math.max(minDim, value);
      maxDim && (value = Math.min(maxDim, value));
      box.w = value;
    }
    if (~attr.indexOf('b')) {
      value = normalizeFloat(startH + deltaY * step, step);
      value = Math.max(minDim, value);
      maxDim && (value = Math.min(maxDim, value));
      box.h = value;
    }
    if (~attr.indexOf('l')) {
      value = normalizeFloat(startW - deltaX * step, step);
      value = Math.max(minDim, value);
      maxDim && (value = Math.min(maxDim, value));
      box.w = value;
    }
    if (~attr.indexOf('t')) {
      value = normalizeFloat(startH - deltaY * step, step);
      value = Math.max(minDim, value);
      maxDim && (value = Math.min(maxDim, value));
      box.h = value;
    }

    // Enforce aspect ratio (unless shift key is being held)
    var ratioActive = opts.ratioDefault ? !data.keys.shift : data.keys.shift;
    if (attr.indexOf('c') < 0 && ratioActive) {
      var ratio = startDim.w / startDim.h;
      if (box.w / box.h > ratio) {
        box.h = Math.round(box.w / ratio);
      } else {
        box.w = Math.round(box.h * ratio);
      }
    }

    if (~attr.indexOf('l')) {
      box.l = startDim.w - box.w;
    }
    if (~attr.indexOf('t')) {
      box.t = startDim.h - box.h;
    }

    return box;
  }
}

export default {
  init(opts) {
    return new Resizer(opts);
  }
};
