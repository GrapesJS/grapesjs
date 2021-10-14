/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/canvas/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  canvas: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const canvas = editor.Canvas;
 * ```
 *
 * * [getConfig](#getconfig)
 * * [getElement](#getelement)
 * * [getFrameEl](#getframeel)
 * * [getWindow](#getwindow)
 * * [getDocument](#getdocument)
 * * [getBody](#getbody)
 * * [setCustomBadgeLabel](#setcustombadgelabel)
 * * [hasFocus](#hasfocus)
 * * [scrollTo](#scrollto)
 * * [setZoom](#setzoom)
 * * [getZoom](#getzoom)
 * * [getCoords](#getcoords)
 * * [setCoords](#setcoords)
 *
 * [Component]: component.html
 *
 * @module Canvas
 */

import { getElement, getViewEl } from 'utils/mixins';
import defaults from './config/config';
import Canvas from './model/Canvas';
import canvasView from './view/CanvasView';

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  let c = {};
  let canvas;
  let CanvasView;

  return {
    /**
     * Used inside RTE
     * @private
     */
    getCanvasView() {
      return CanvasView;
    },

    name: 'Canvas',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @private
     */
    init(config = {}) {
      c = {
        ...defaults,
        ...config,
        module: this
      };

      this.em = c.em;
      const { scripts, styles } = c;
      const ppfx = c.pStylePrefix;
      if (ppfx) c.stylePrefix = ppfx + c.stylePrefix;
      canvas = new Canvas({ scripts, styles }, config);
      this.model = canvas;
      this.startAutoscroll = this.startAutoscroll.bind(this);
      this.stopAutoscroll = this.stopAutoscroll.bind(this);
      return this;
    },

    onLoad() {
      this.model.init();
    },

    getModel() {
      return canvas;
    },

    /**
     * Get the configuration object
     * @returns {Object} Configuration object
     * @example
     * console.log(canvas.getConfig())
     */
    getConfig() {
      return c;
    },

    /**
     * Get the canvas element
     * @returns {HTMLElement}
     */
    getElement() {
      return CanvasView.el;
    },

    getFrame(index) {
      return this.getFrames()[index || 0];
    },

    /**
     * Get the main frame element of the canvas
     * @returns {HTMLIFrameElement}
     */
    getFrameEl() {
      const { frame } = CanvasView || {};
      return frame && frame.el;
    },

    getFramesEl() {
      return CanvasView.framesArea;
    },

    /**
     * Get the main frame window instance
     * @returns {Window}
     */
    getWindow() {
      return this.getFrameEl().contentWindow;
    },

    /**
     * Get the main frame document element
     * @returns {HTMLDocument}
     */
    getDocument() {
      const frame = this.getFrameEl();
      return frame && frame.contentDocument;
    },

    /**
     * Get the main frame body element
     * @return {HTMLBodyElement}
     */
    getBody() {
      const doc = this.getDocument();
      return doc && doc.body;
    },

    _getCompFrame(compView) {
      return compView && compView._getFrame();
    },

    _getLocalEl(globalEl, compView, method) {
      let result = globalEl;
      const frameView = this._getCompFrame(compView);
      result = frameView ? frameView[method]() : result;

      return result;
    },

    /**
     * Returns element containing all global canvas tools
     * @returns {HTMLElement}
     * @private
     */
    getGlobalToolsEl() {
      return CanvasView.toolsGlobEl;
    },

    /**
     * Returns element containing all canvas tools
     * @returns {HTMLElement}
     * @private
     */
    getToolsEl(compView) {
      return this._getLocalEl(CanvasView.toolsEl, compView, 'getToolsEl');
    },

    /**
     * Returns highlighter element
     * @returns {HTMLElement}
     * @private
     */
    getHighlighter(compView) {
      return this._getLocalEl(CanvasView.hlEl, compView, 'getHighlighter');
    },

    /**
     * Returns badge element
     * @returns {HTMLElement}
     * @private
     */
    getBadgeEl(compView) {
      return this._getLocalEl(CanvasView.badgeEl, compView, 'getBadgeEl');
    },

    /**
     * Returns placer element
     * @returns {HTMLElement}
     * @private
     */
    getPlacerEl() {
      return CanvasView.placerEl;
    },

    /**
     * Returns ghost element
     * @returns {HTMLElement}
     * @private
     */
    getGhostEl() {
      return CanvasView.ghostEl;
    },

    /**
     * Returns toolbar element
     * @returns {HTMLElement}
     * @private
     */
    getToolbarEl() {
      return CanvasView.toolbarEl;
    },

    /**
     * Returns resizer element
     * @returns {HTMLElement}
     * @private
     */
    getResizerEl() {
      return CanvasView.resizerEl;
    },

    /**
     * Returns offset viewer element
     * @returns {HTMLElement}
     * @private
     */
    getOffsetViewerEl(compView) {
      return this._getLocalEl(
        CanvasView.offsetEl,
        compView,
        'getOffsetViewerEl'
      );
    },

    /**
     * Returns fixed offset viewer element
     * @returns {HTMLElement}
     * @private
     */
    getFixedOffsetViewerEl() {
      return CanvasView.fixedOffsetEl;
    },

    render() {
      CanvasView && CanvasView.remove();
      CanvasView = new canvasView({
        model: canvas,
        config: c
      });
      return CanvasView.render().el;
    },

    /**
     * Get frame position
     * @returns {Object}
     * @private
     */
    getOffset() {
      var frameOff = this.offset(this.getFrameEl());
      var canvasOff = this.offset(this.getElement());
      return {
        top: frameOff.top - canvasOff.top,
        left: frameOff.left - canvasOff.left
      };
    },

    /**
     * Get the offset of the passed component element
     * @param  {HTMLElement} el
     * @returns {Object}
     * @private
     */
    offset(el) {
      return CanvasView.offset(el);
    },

    /**
     * Set custom badge naming strategy
     * @param  {Function} f
     * @example
     * canvas.setCustomBadgeLabel(function(component){
     *  return component.getName();
     * });
     */
    setCustomBadgeLabel(f) {
      c.customBadgeLabel = f;
    },

    /**
     * Get element position relative to the canvas
     * @param {HTMLElement} el
     * @returns {Object}
     * @private
     */
    getElementPos(el, opts) {
      return CanvasView.getElementPos(el, opts);
    },

    /**
     * Returns element's offsets like margins and paddings
     * @param {HTMLElement} el
     * @returns {Object}
     * @private
     */
    getElementOffsets(el) {
      return CanvasView.getElementOffsets(el);
    },

    /**
     * Get canvas rectangular data
     * @returns {Object}
     */
    getRect() {
      const { top, left } = CanvasView.getPosition();
      return {
        ...CanvasView.getCanvasOffset(),
        topScroll: top,
        leftScroll: left
      };
    },

    /**
     * This method comes handy when you need to attach something like toolbars
     * to elements inside the canvas, dealing with all relative position,
     * offsets, etc. and returning as result the object with positions which are
     * viewable by the user (when the canvas is scrolled the top edge of the element
     * is not viewable by the user anymore so the new top edge is the one of the canvas)
     *
     * The target should be visible before being passed here as invisible elements
     * return empty string as width
     * @param {HTMLElement} target The target in this case could be the toolbar
     * @param {HTMLElement} element The element on which I'd attach the toolbar
     * @param {Object} options Custom options
     * @param {Boolean} options.toRight Set to true if you want the toolbar attached to the right
     * @return {Object}
     * @private
     */
    getTargetToElementDim(target, element, options = {}) {
      var opts = options || {};
      var canvasPos = CanvasView.getPosition();
      if (!canvasPos) return;
      var pos = opts.elPos || CanvasView.getElementPos(element);
      var toRight = options.toRight || 0;
      var targetHeight = opts.targetHeight || target.offsetHeight;
      var targetWidth = opts.targetWidth || target.offsetWidth;
      var eventToTrigger = opts.event || null;

      var elTop = pos.top - targetHeight;
      var elLeft = pos.left;
      elLeft += toRight ? pos.width : 0;
      elLeft = toRight ? elLeft - targetWidth : elLeft;

      var leftPos = elLeft < canvasPos.left ? canvasPos.left : elLeft;
      var topPos = elTop < canvasPos.top ? canvasPos.top : elTop;
      topPos = topPos > pos.top + pos.height ? pos.top + pos.height : topPos;

      var result = {
        top: topPos,
        left: leftPos,
        elementTop: pos.top,
        elementLeft: pos.left,
        elementWidth: pos.width,
        elementHeight: pos.height,
        targetWidth: target.offsetWidth,
        targetHeight: target.offsetHeight,
        canvasTop: canvasPos.top,
        canvasLeft: canvasPos.left,
        canvasWidth: canvasPos.width,
        canvasHeight: canvasPos.height
      };

      // In this way I can catch data and also change the position strategy
      if (eventToTrigger && c.em) {
        c.em.trigger(eventToTrigger, result);
      }

      return result;
    },

    canvasRectOffset(el, pos, opts = {}) {
      const getFrameElFromDoc = doc => {
        const { defaultView } = doc;
        return defaultView && defaultView.frameElement;
      };

      const rectOff = (el, top = 1, pos) => {
        const zoom = this.em.getZoomDecimal();
        const side = top ? 'top' : 'left';
        const doc = el.ownerDocument;
        const { offsetTop = 0, offsetLeft = 0 } = opts.offset
          ? getFrameElFromDoc(doc)
          : {};
        const { scrollTop = 0, scrollLeft = 0 } = doc.body || {};
        const scroll = top ? scrollTop : scrollLeft;
        const offset = top ? offsetTop : offsetLeft;

        // if (!top) {
        //   console.log('LEFT', { posLeft: pos[side], scroll, offset }, el);
        // }

        return pos[side] - (scroll - offset) * zoom;
      };

      return {
        top: rectOff(el, 1, pos),
        left: rectOff(el, 0, pos)
      };
    },

    getTargetToElementFixed(el, elToMove, opts = {}) {
      const pos = opts.pos || this.getElementPos(el);
      const cvOff = opts.canvasOff || this.canvasRectOffset(el, pos);
      const toolbarH = elToMove.offsetHeight || 0;
      const toolbarW = elToMove.offsetWidth || 0;
      const elRight = pos.left + pos.width;
      const cv = this.getCanvasView();
      const frCvOff = cv.getPosition();
      const frameOffset = cv.getFrameOffset(el);
      const { event } = opts;

      let top = -toolbarH;
      let left = pos.width - toolbarW;
      left = pos.left < -left ? -pos.left : left;
      left = elRight > frCvOff.width ? left - (elRight - frCvOff.width) : left;

      // Scroll with the window if the top edge is reached and the
      // element is bigger than the canvas
      const fullHeight = pos.height + toolbarH;
      const elIsShort = fullHeight < frameOffset.height;

      if (cvOff.top < toolbarH) {
        if (elIsShort) {
          top = top + fullHeight;
        } else {
          top = -cvOff.top < pos.height ? -cvOff.top : pos.height;
        }
      }

      const result = {
        top,
        left,
        canvasOffsetTop: cvOff.top,
        canvasOffsetLeft: cvOff.left
      };

      // In this way I can catch data and also change the position strategy
      event && this.em.trigger(event, result);

      return result;
    },

    getTargetToElementFixedBottom(el, elToMove, opts = {}) {
      const pos = opts.pos || this.getElementPos(el);
      const cvOff = opts.canvasOff || this.canvasRectOffset(el, pos);
      const toolbarH = elToMove.offsetHeight || 0;
      const toolbarW = elToMove.offsetWidth || 0;
      const elRight = pos.left + pos.width;
      const cv = this.getCanvasView();
      const frCvOff = cv.getPosition();
      const frameOffset = cv.getFrameOffset(el);
      const { event } = opts;

      let bottom = -toolbarH;
      let left = pos.width - toolbarW;
      left = pos.left < -left ? -pos.left : left;
      left = elRight > frCvOff.width ? left - (elRight - frCvOff.width) : left;

      // Scroll with the window if the bottom edge is reached and the
      // element is bigger than the canvas
      const fullHeight = pos.height + toolbarH;
      const elIsShort = fullHeight < frameOffset.height;
      const cvOffBottom = cvOff.top + pos.height;

      if (frCvOff.height - cvOffBottom < toolbarH) {
        if (elIsShort) {
          bottom = bottom + fullHeight;
        } else {
          bottom = cvOff.top < 0 ? cvOffBottom - frCvOff.height : pos.height;
        }
      }

      const result = {
        bottom,
        left,
        canvasOffsetTop: cvOff.top,
        canvasOffsetLeft: cvOff.left
      };

      // In this way I can catch data and also change the position strategy
      event && this.em.trigger(event, result);

      return result;
    },

    /**
     * Instead of simply returning e.clientX and e.clientY this function
     * calculates also the offset based on the canvas. This is helpful when you
     * need to get X and Y position while moving between the editor area and
     * canvas area, which is in the iframe
     * @param {Event} e
     * @return {Object}
     * @private
     */
    getMouseRelativePos(e, options) {
      var opts = options || {};
      var addTop = 0;
      var addLeft = 0;
      var subWinOffset = opts.subWinOffset;
      var doc = e.target.ownerDocument;
      var win = doc.defaultView || doc.parentWindow;
      var frame = win.frameElement;
      var yOffset = subWinOffset ? win.pageYOffset : 0;
      var xOffset = subWinOffset ? win.pageXOffset : 0;

      if (frame) {
        var frameRect = frame.getBoundingClientRect();
        addTop = frameRect.top || 0;
        addLeft = frameRect.left || 0;
      }

      return {
        y: e.clientY + addTop - yOffset,
        x: e.clientX + addLeft - xOffset
      };
    },

    /**
     * X and Y mouse position relative to the canvas
     * @param {Event} ev
     * @return {Object}
     * @private
     */
    getMouseRelativeCanvas(ev, opts) {
      const zoom = this.getZoomDecimal();
      const { top, left } = CanvasView.getPosition(opts);

      return {
        y: ev.clientY * zoom + top,
        x: ev.clientX * zoom + left
      };
    },

    /**
     * Check if the canvas is focused
     * @returns {Boolean}
     */
    hasFocus() {
      return this.getDocument().hasFocus();
    },

    /**
     * Detects if some input is focused (input elements, text components, etc.)
     * @return {Boolean}
     * @private
     */
    isInputFocused() {
      const doc = this.getDocument();
      const frame = this.getFrameEl();
      const toIgnore = ['body', ...this.getConfig().notTextable];
      const docActive = frame && document.activeElement === frame;
      const focused = docActive
        ? doc && doc.activeElement
        : document.activeElement;

      return focused && !toIgnore.some(item => focused.matches(item));
    },

    /**
     * Scroll canvas to the element if it's not visible. The scrolling is
     * executed via `scrollIntoView` API and options of this method are
     * passed to it. For instance, you can scroll smoothly by using
     * `{ behavior: 'smooth' }`.
     * @param  {HTMLElement|[Component]} el
     * @param  {Object} [opts={}] Options, same as options for `scrollIntoView`
     * @param  {Boolean} [opts.force=false] Force the scroll, even if the element is already visible
     * @example
     * const selected = editor.getSelected();
     * // Scroll smoothly (this behavior can be polyfilled)
     * canvas.scrollTo(selected, { behavior: 'smooth' });
     * // Force the scroll, even if the element is alredy visible
     * canvas.scrollTo(selected, { force: true });
     */
    scrollTo(el, opts = {}) {
      const elem = getElement(el);
      const view = elem && getViewEl(elem);
      view && view.scrollIntoView(opts);
    },

    /**
     * Start autoscroll
     * @private
     */
    startAutoscroll(frame) {
      const fr = (frame && frame.view) || this.em.getCurrentFrame();
      fr && fr.startAutoscroll();
    },

    /**
     * Stop autoscroll
     * @private
     */
    stopAutoscroll(frame) {
      const fr = (frame && frame.view) || this.em.getCurrentFrame();
      fr && fr.stopAutoscroll();
    },

    /**
     * Set canvas zoom value
     * @param {Number} value The zoom value, from 0 to 100
     * @returns {this}
     * @example
     * canvas.setZoom(50); // set zoom to 50%
     */
    setZoom(value) {
      canvas.set('zoom', parseFloat(value));
      return this;
    },

    /**
     * Get canvas zoom value
     * @returns {Number}
     * @example
     * canvas.setZoom(50); // set zoom to 50%
     * const zoom = canvas.getZoom(); // 50
     */
    getZoom() {
      return parseFloat(canvas.get('zoom'));
    },

    /**
     * Set canvas position coordinates
     * @param {Number} x Horizontal position
     * @param {Number} y Vertical position
     * @returns {this}
     * @example
     * canvas.setCoords(100, 100);
     */
    setCoords(x, y) {
      canvas.set({ x: parseFloat(x), y: parseFloat(y) });
      return this;
    },

    /**
     * Get canvas position coordinates
     * @returns {Object} Object containing coordinates
     * @example
     * canvas.setCoords(100, 100);
     * const coords = canvas.getCoords();
     * // { x: 100, y: 100 }
     */
    getCoords() {
      const { x, y } = canvas.attributes;
      return { x, y };
    },

    getZoomDecimal() {
      return this.getZoom() / 100;
    },

    getZoomMultiplier() {
      const zoom = this.getZoomDecimal();
      return zoom ? 1 / zoom : 1;
    },

    toggleFramesEvents(on) {
      const { style } = this.getFramesEl();
      style.pointerEvents = on ? '' : 'none';
    },

    getFrames() {
      return canvas.get('frames').map(item => item);
    },

    /**
     * Add new frame to the canvas
     * @param {Object} props Frame properties
     * @returns {Frame}
     * @example
     * canvas.addFrame({
     *   name: 'Mobile home page',
     *   x: 100, // Position in canvas
     *   y: 100,
     *   width: 500, // Frame dimensions
     *   height: 600,
     *   // device: 'DEVICE-ID',
     *   components: [
     *     '<h1 class="testh">Title frame</h1>',
     *     '<p class="testp">Paragraph frame</p>',
     *   ],
     *   styles: `
     *     .testh { color: red; }
     *     .testp { color: blue; }
     *   `,
     * });
     */
    addFrame(props = {}, opts = {}) {
      return canvas.get('frames').add(
        {
          ...props
        },
        {
          ...opts,
          em: this.em
        }
      );
    },

    destroy() {
      canvas.stopListening();
      CanvasView && CanvasView.remove();
      [c, canvas, CanvasView].forEach(i => (i = {}));
      ['em', 'model', 'droppable'].forEach(i => (this[i] = {}));
    }
  };
};
