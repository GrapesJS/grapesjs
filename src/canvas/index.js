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
 * * [getWrapperEl](#getwrapperel)
 * * [setCustomBadgeLabel](#setcustombadgelabel)
 * * [hasFocus](#hasfocus)
 * * [scrollTo](#scrollto)
 * * [setZoom](#setzoom)
 * * [getZoom](#getzoom)
 *
 * @module Canvas
 */

import {
  on,
  off,
  hasDnd,
  getElement,
  getPointerEvent,
  getViewEl
} from 'utils/mixins';
import { debounce } from 'underscore';
import Droppable from 'utils/Droppable';
import defaults from './config/config';
import Canvas from './model/Canvas';
import canvasView from './view/CanvasView';

const { requestAnimationFrame } = window;

export default () => {
  let c = {};
  let canvas;
  let frameRect;
  let CanvasView;

  return {
    /**
     * Used inside RTE
     * @private
     */
    getCanvasView() {
      return CanvasView;
    },

    /**
     * Name of the module
     * @type {String}
     * @private
     */
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
      const ppfx = c.pStylePrefix;
      if (ppfx) c.stylePrefix = ppfx + c.stylePrefix;

      canvas = new Canvas(config);
      CanvasView = new canvasView({
        model: canvas,
        config: c
      });

      var cm = c.em.get('DomComponents');
      if (cm) this.setWrapper(cm);

      this.model = canvas;
      this.startAutoscroll = this.startAutoscroll.bind(this);
      this.stopAutoscroll = this.stopAutoscroll.bind(this);
      return this;
    },

    /**
     * Get the configuration object
     * @return {Object}
     */
    getConfig() {
      return c;
    },

    /**
     * Add wrapper
     * @param	{Object}	wrp Wrapper
     * @private
     * */
    setWrapper(wrp) {
      canvas.set('wrapper', wrp);
    },

    /**
     * Get the canvas element
     * @return {HTMLElement}
     */
    getElement() {
      return CanvasView.el;
    },

    getFrame() {
      return canvas.get('frame');
    },

    /**
     * Get the iframe element of the canvas
     * @return {HTMLIFrameElement}
     */
    getFrameEl() {
      const { frame } = CanvasView;
      return frame && frame.el;
    },

    getFramesEl() {
      return CanvasView.framesArea;
    },

    /**
     * Get the window instance of the iframe element
     * @return {Window}
     */
    getWindow() {
      return this.getFrameEl().contentWindow;
    },

    /**
     * Get the document of the iframe element
     * @return {HTMLDocument}
     */
    getDocument() {
      const frame = this.getFrameEl();
      return frame && frame.contentDocument;
    },

    /**
     * Get the body of the iframe element
     * @return {HTMLBodyElement}
     */
    getBody() {
      const doc = this.getDocument();
      return doc && doc.body;
    },

    /**
     * Get the wrapper element containing all the components
     * @return {HTMLElement}
     */
    getWrapperEl() {
      const body = this.getBody();
      return body && body.querySelector('#wrapper');
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
     * @return {HTMLElement}
     * @private
     */
    getGlobalToolsEl() {
      return CanvasView.toolsGlobEl;
    },

    /**
     * Returns element containing all canvas tools
     * @return {HTMLElement}
     * @private
     */
    getToolsEl(compView) {
      return this._getLocalEl(CanvasView.toolsEl, compView, 'getToolsEl');
    },

    /**
     * Returns highlighter element
     * @return {HTMLElement}
     * @private
     */
    getHighlighter(compView) {
      return this._getLocalEl(CanvasView.hlEl, compView, 'getHighlighter');
    },

    /**
     * Returns badge element
     * @return {HTMLElement}
     * @private
     */
    getBadgeEl(compView) {
      return this._getLocalEl(CanvasView.badgeEl, compView, 'getBadgeEl');
    },

    /**
     * Returns placer element
     * @return {HTMLElement}
     * @private
     */
    getPlacerEl() {
      return CanvasView.placerEl;
    },

    /**
     * Returns ghost element
     * @return {HTMLElement}
     * @private
     */
    getGhostEl() {
      return CanvasView.ghostEl;
    },

    /**
     * Returns toolbar element
     * @return {HTMLElement}
     * @private
     */
    getToolbarEl() {
      return CanvasView.toolbarEl;
    },

    /**
     * Returns resizer element
     * @return {HTMLElement}
     * @private
     */
    getResizerEl() {
      return CanvasView.resizerEl;
    },

    /**
     * Returns offset viewer element
     * @return {HTMLElement}
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
     * @return {HTMLElement}
     * @private
     */
    getFixedOffsetViewerEl() {
      return CanvasView.fixedOffsetEl;
    },

    /**
     * Render canvas
     * @private
     * */
    render() {
      return CanvasView.render().el;
    },

    /**
     * Get frame position
     * @return {Object}
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
     * @return {Object}
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
     * @return {Object}
     * @private
     */
    getElementPos(el, opts) {
      return CanvasView.getElementPos(el, opts);
    },

    /**
     * Returns element's offsets like margins and paddings
     * @param {HTMLElement} el
     * @return {Object}
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
     * @return {Boolean}
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
      const toIgnore = ['body', ...this.getConfig().notTextable];
      const focused = doc && doc.activeElement;

      return focused && !toIgnore.some(item => focused.matches(item));
    },

    /**
     * Scroll canvas to the element if it's not visible. The scrolling is
     * executed via `scrollIntoView` API and options of this method are
     * passed to it. For instance, you can scroll smoothly by using
     * `{ behavior: 'smooth' }`.
     * @param  {HTMLElement|Component} el
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

    postRender() {
      if (hasDnd(c.em)) this.droppable = new Droppable(c.em);
    },

    /**
     * Set zoom value
     * @param {Number} value The zoom value, from 0 to 100
     * @returns {this}
     */
    setZoom(value) {
      canvas.set('zoom', parseFloat(value));
      return this;
    },

    /**
     * Get zoom value
     * @returns {Number}
     */
    getZoom() {
      return parseFloat(canvas.get('zoom'));
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

    /**
     * Returns wrapper element
     * @return {HTMLElement}
     * ????
     * @private
     */
    getFrameWrapperEl() {
      return CanvasView.frame.getWrapper();
    },

    getFrames() {
      return canvas.get('frames').map(item => item);
    },

    /**
     * Add new frame to canvas
     * @param {Object} props Frame properties
     * @example
     *
        editor.Canvas.addFrame({
          name: 'Mobile home page',
          x: 100, // Position in canvas
          y: 100,
          width: 500, // Frame dimensions
          height: 600,
          // device: 'DEVICE-ID',
          components: [
            '<h1 class="testh">Title frame</h1>',
            '<p class="testp">Paragraph frame</p>',
          ],
          styles: `
            .testh { color: red; }
            .testp { color: blue; }
          `,
        });
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
    }
  };
};
