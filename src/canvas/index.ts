/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/GrapesJS/grapesjs/blob/master/src/canvas/config/config.ts)
 * ```js
 * const editor = grapesjs.init({
 *  canvas: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
 *
 * ```js
 * // Listen to events
 * editor.on('canvas:drop', () => { ... });
 *
 * // Use the API
 * const canvas = editor.Canvas;
 * canvas.setCoords(...);
 * ```
 *
 * {REPLACE_EVENTS}
 *
 * [Component]: component.html
 * [Frame]: frame.html
 * [CanvasSpot]: canvas_spot.html
 *
 * @module Canvas
 */

import { isArray, isUndefined } from 'underscore';
import { Module } from '../abstract';
import { AddOptions, Coordinates } from '../common';
import Component from '../dom_components/model/Component';
import ComponentView from '../dom_components/view/ComponentView';
import EditorModel from '../editor/model/Editor';
import { getElement, getViewEl } from '../utils/mixins';
import defaults, { CanvasConfig } from './config/config';
import Canvas from './model/Canvas';
import CanvasSpot, { CanvasSpotBuiltInTypes, CanvasSpotProps } from './model/CanvasSpot';
import CanvasSpots from './model/CanvasSpots';
import Frame from './model/Frame';
import { CanvasEvents, CanvasRefreshOptions, ToWorldOption } from './types';
import CanvasView, { FitViewportOptions } from './view/CanvasView';
import FrameView from './view/FrameView';

export type CanvasEvent = `${CanvasEvents}`;

export default class CanvasModule extends Module<CanvasConfig> {
  /**
   * Get configuration object
   * @name getConfig
   * @function
   * @return {Object}
   */

  /**
   * Used inside RTE
   * @private
   */
  getCanvasView(): CanvasView {
    return this.canvasView as any;
  }

  canvas: Canvas;
  model: Canvas;
  spots: CanvasSpots;
  events = CanvasEvents;
  framesById: Record<string, Frame | undefined> = {};
  private canvasView?: CanvasView;

  /**
   * Initialize module. Automatically called with a new instance of the editor
   * @param {Object} config Configurations
   * @private
   */
  constructor(em: EditorModel) {
    super(em, 'Canvas', defaults);

    this.canvas = new Canvas(this);
    this.spots = new CanvasSpots(this);
    this.model = this.canvas;
    this.startAutoscroll = this.startAutoscroll.bind(this);
    this.stopAutoscroll = this.stopAutoscroll.bind(this);
    return this;
  }

  postLoad() {
    this.model.init();
  }

  getModel() {
    return this.canvas;
  }

  /**
   * Get the canvas element
   * @returns {HTMLElement}
   */
  getElement() {
    return this.getCanvasView().el;
  }

  getFrame(index?: number) {
    return this.getFrames()[index || 0];
  }

  /**
   * Get the main frame element of the canvas
   * @returns {HTMLIFrameElement}
   */
  getFrameEl() {
    const { frame } = this.canvasView || {};
    return frame?.el as HTMLIFrameElement;
  }

  getFramesEl() {
    return this.canvasView?.framesArea as HTMLElement;
  }

  /**
   * Get the main frame window instance
   * @returns {Window}
   */
  getWindow() {
    const { frame } = this.canvasView || {};
    return frame?.getWindow() as Window;
  }

  /**
   * Get the main frame document element
   * @returns {HTMLDocument}
   */
  getDocument() {
    const frame = this.getFrameEl();
    return frame?.contentDocument as Document;
  }

  /**
   * Get the main frame body element
   * @return {HTMLBodyElement}
   */
  getBody() {
    const doc = this.getDocument();
    return doc?.body as HTMLBodyElement;
  }

  _getLocalEl(globalEl: any, compView: ComponentView, method: keyof FrameView) {
    let result = globalEl;
    const frameView = compView?.frameView;
    result = frameView ? (frameView as any)[method]() : result;

    return result;
  }

  /**
   * Returns element containing all global canvas tools
   * @returns {HTMLElement}
   * @private
   */
  getGlobalToolsEl() {
    return this.canvasView?.toolsGlobEl;
  }

  /**
   * Returns element containing all canvas tools
   * @returns {HTMLElement}
   * @private
   */
  getToolsEl(compView?: any) {
    return this._getLocalEl(this.getCanvasView().toolsEl, compView, 'getToolsEl');
  }

  /**
   * Returns highlighter element
   * @returns {HTMLElement}
   * @private
   */
  getHighlighter(compView?: any) {
    return this._getLocalEl(this.getCanvasView().hlEl, compView, 'getHighlighter');
  }

  /**
   * Returns badge element
   * @returns {HTMLElement}
   * @private
   */
  getBadgeEl(compView: any) {
    return this._getLocalEl(this.getCanvasView().badgeEl, compView, 'getBadgeEl');
  }

  /**
   * Returns placer element
   * @returns {HTMLElement}
   * @private
   */
  getPlacerEl() {
    return this.getCanvasView().placerEl;
  }

  /**
   * Returns ghost element
   * @returns {HTMLElement}
   * @private
   */
  getGhostEl() {
    return this.getCanvasView().ghostEl;
  }

  /**
   * Returns toolbar element
   * @returns {HTMLElement}
   * @private
   */
  getToolbarEl() {
    return this.getCanvasView().toolbarEl;
  }

  /**
   * Returns resizer element
   * @returns {HTMLElement}
   * @private
   */
  getResizerEl() {
    return this.getCanvasView().resizerEl;
  }

  /**
   * Returns offset viewer element
   * @returns {HTMLElement}
   * @private
   */
  getOffsetViewerEl(compView: any) {
    return this._getLocalEl(this.getCanvasView().offsetEl, compView, 'getOffsetViewerEl');
  }

  /**
   * Returns fixed offset viewer element
   * @returns {HTMLElement}
   * @private
   */
  getFixedOffsetViewerEl() {
    return this.getCanvasView().fixedOffsetEl;
  }

  getSpotsEl() {
    return this.canvasView?.spotsEl;
  }

  render(): HTMLElement {
    this.canvasView?.remove();
    this.canvasView = new CanvasView(this.canvas);
    return this.canvasView.render().el;
  }

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
      left: frameOff.left - canvasOff.left,
    };
  }

  /**
   * Get the offset of the passed component element
   * @param  {HTMLElement} el
   * @returns {Object}
   * @private
   */
  offset(el: HTMLElement) {
    return this.getCanvasView().offset(el);
  }

  /**
   * Set custom badge naming strategy
   * @param  {Function} f
   * @example
   * canvas.setCustomBadgeLabel(function(component){
   *  return component.getName();
   * });
   */
  setCustomBadgeLabel(f: Function) {
    //@ts-ignore
    this.config.customBadgeLabel = f;
  }

  /**
   * Get element position relative to the canvas
   * @param {HTMLElement} el
   * @returns {Object}
   * @private
   */
  getElementPos(el: HTMLElement, opts?: any) {
    return this.getCanvasView().getElementPos(el, opts);
  }

  /**
   * Returns element's offsets like margins and paddings
   * @param {HTMLElement} el
   * @returns {Object}
   * @private
   */
  getElementOffsets(el: HTMLElement) {
    return this.getCanvasView().getElementOffsets(el);
  }

  /**
   * Get canvas rectangular data
   * @returns {Object}
   */
  getRect() {
    const { top = 0, left = 0 } = this.getCanvasView().getPosition() ?? {};
    return {
      ...this.getCanvasView().getCanvasOffset(),
      topScroll: top,
      leftScroll: left,
    };
  }

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
  getTargetToElementDim(target: HTMLElement, element: HTMLElement, options: any = {}) {
    var opts = options || {};
    var canvasPos = this.getCanvasView().getPosition();
    if (!canvasPos) return;
    var pos = opts.elPos || this.getCanvasView().getElementPos(element);
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
      canvasHeight: canvasPos.height,
    };

    // In this way I can catch data and also change the position strategy
    if (eventToTrigger && this.em) {
      this.em.trigger(eventToTrigger, result);
    }

    return result;
  }

  canvasRectOffset(el: HTMLElement, pos: { top: number; left: number }, opts: any = {}) {
    const getFrameElFromDoc = (doc: Document) => {
      const { defaultView } = doc;
      return defaultView?.frameElement as HTMLElement;
    };

    const rectOff = (el: HTMLElement, top = 1, pos: { top: number; left: number }) => {
      const zoom = this.em.getZoomDecimal();
      const side = top ? 'top' : 'left';
      const doc = el.ownerDocument;
      const { offsetTop = 0, offsetLeft = 0 } = opts.offset ? getFrameElFromDoc(doc) : {};
      const { scrollTop = 0, scrollLeft = 0 } = doc.body || {};
      const scroll = top ? scrollTop : scrollLeft;
      const offset = top ? offsetTop : offsetLeft;

      return pos[side] - (scroll - offset) * zoom;
    };

    return {
      top: rectOff(el, 1, pos),
      left: rectOff(el, 0, pos),
    };
  }

  /**
   *
   * @param {HTMLElement} el The component element in the canvas
   * @param {HTMLElement} targetEl The target element to position (eg. toolbar)
   * @param {Object} opts
   * @private
   */
  getTargetToElementFixed(el: HTMLElement, targetEl: HTMLElement, opts: any = {}) {
    const elRect = opts.pos || this.getElementPos(el, { noScroll: true });
    const canvasOffset = opts.canvasOff || this.canvasRectOffset(el, elRect);
    const targetHeight = targetEl.offsetHeight || 0;
    const targetWidth = targetEl.offsetWidth || 0;
    const elRight = elRect.left + elRect.width;
    const canvasView = this.getCanvasView();
    const canvasRect = canvasView.getPosition();
    const frameOffset = canvasView.getFrameOffset(el);
    const { event } = opts;

    let top = -targetHeight;
    let left = !isUndefined(opts.left) ? opts.left : elRect.width - targetWidth;
    left = elRect.left < -left ? -elRect.left : left;
    left = elRight > canvasRect.width ? left - (elRight - canvasRect.width) : left;

    // Check when the target top edge reaches the top of the viewable canvas
    if (canvasOffset.top < targetHeight) {
      const fullHeight = elRect.height + targetHeight;
      const elIsShort = fullHeight < frameOffset.height;

      // Scroll with the window if the top edge is reached and the
      // element is bigger than the canvas
      if (elIsShort) {
        top = top + fullHeight;
      } else {
        top = -canvasOffset.top < elRect.height ? -canvasOffset.top : elRect.height;
      }
    }

    const result = {
      top,
      left,
      canvasOffsetTop: canvasOffset.top,
      canvasOffsetLeft: canvasOffset.left,
      elRect,
      canvasOffset,
      canvasRect,
      targetWidth,
      targetHeight,
    };

    // In this way I can catch data and also change the position strategy
    event && this.em.trigger(event, result);

    return result;
  }

  /**
   * Instead of simply returning e.clientX and e.clientY this function
   * calculates also the offset based on the canvas. This is helpful when you
   * need to get X and Y position while moving between the editor area and
   * canvas area, which is in the iframe
   * @param {Event} e
   * @return {Object}
   * @private
   */
  getMouseRelativePos(e: any, opts: any = {}) {
    const subWinOffset = opts.subWinOffset;
    const doc = e.target.ownerDocument;
    const win = doc.defaultView || doc.parentWindow;
    const frame = win.frameElement;
    const yOffset = subWinOffset ? win.pageYOffset : 0;
    const xOffset = subWinOffset ? win.pageXOffset : 0;
    const zoomMlt = this.getZoomMultiplier();
    let addTop = 0;
    let addLeft = 0;

    if (frame) {
      var frameRect = frame.getBoundingClientRect();
      addTop = frameRect.top || 0;
      addLeft = frameRect.left || 0;
    }

    return {
      y: (e.clientY + addTop - yOffset) * zoomMlt,
      x: (e.clientX + addLeft - xOffset) * zoomMlt,
    };
  }

  /**
   * X and Y mouse position relative to the canvas
   * @param {Event} ev
   * @return {Object}
   * @private
   */
  getMouseRelativeCanvas(ev: MouseEvent, opts: any) {
    const zoom = this.getZoomDecimal();
    const { top = 0, left = 0 } = this.getCanvasView().getPosition(opts) ?? {};

    return {
      y: ev.clientY * zoom + top,
      x: ev.clientX * zoom + left,
    };
  }

  /**
   * Check if the canvas is focused
   * @returns {Boolean}
   */
  hasFocus() {
    return this.getDocument().hasFocus();
  }

  /**
   * Detects if some input is focused (input elements, text components, etc.)
   * @return {Boolean}
   * @private
   */
  isInputFocused() {
    const doc = this.getDocument();
    const frame = this.getFrameEl();
    const toIgnore = ['body', ...this.config.notTextable!];
    const docActive = frame && document.activeElement === frame;
    const focused = docActive ? doc && doc.activeElement : document.activeElement;

    return focused && !toIgnore.some(item => focused.matches(item));
  }

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
  scrollTo(el: any, opts = {}) {
    const elem = getElement(el);
    const view = elem && getViewEl(elem);
    view && view.scrollIntoView(opts);
  }

  /**
   * Start autoscroll
   * @private
   */
  startAutoscroll(frame?: Frame) {
    const fr = (frame && frame.view) || this.em.getCurrentFrame();
    fr && fr.startAutoscroll();
  }

  /**
   * Stop autoscroll
   * @private
   */
  stopAutoscroll(frame?: Frame) {
    const fr = (frame && frame.view) || this.em.getCurrentFrame();
    fr && fr.stopAutoscroll();
  }

  /**
   * Set canvas zoom value
   * @param {Number} value The zoom value, from 0 to 100
   * @returns {this}
   * @example
   * canvas.setZoom(50); // set zoom to 50%
   */
  setZoom(value: number | string) {
    this.canvas.set('zoom', typeof value === 'string' ? parseFloat(value) : value);
    return this;
  }

  /**
   * Get canvas zoom value
   * @returns {Number}
   * @example
   * canvas.setZoom(50); // set zoom to 50%
   * const zoom = canvas.getZoom(); // 50
   */
  getZoom() {
    return parseFloat(this.canvas.get('zoom'));
  }

  /**
   * Set canvas position coordinates
   * @param {Number} x Horizontal position
   * @param {Number} y Vertical position
   * @returns {this}
   * @example
   * canvas.setCoords(100, 100);
   */
  setCoords(x?: string | number, y?: string | number, opts: ToWorldOption = {}) {
    const hasX = x || x === 0;
    const hasY = y || y === 0;
    const coords = {
      x: this.canvas.get('x'),
      y: this.canvas.get('y'),
    };

    if (hasX) coords.x = parseFloat(`${x}`);
    if (hasY) coords.y = parseFloat(`${y}`);

    if (opts.toWorld) {
      const delta = this.canvasView?.getViewportDelta();
      if (delta) {
        if (hasX) coords.x = coords.x - delta.x;
        if (hasY) coords.y = coords.y - delta.y;
      }
    }

    this.canvas.set(coords);

    return this;
  }

  /**
   * Get canvas position coordinates
   * @returns {Object} Object containing coordinates
   * @example
   * canvas.setCoords(100, 100);
   * const coords = canvas.getCoords();
   * // { x: 100, y: 100 }
   */
  getCoords(): Coordinates {
    const { x, y } = this.canvas.attributes;
    return { x, y };
  }

  /**
   * Get canvas pointer position coordinates.
   * @returns {Object} Object containing pointer coordinates
   * @private
   * @example
   * const worldPointer = canvas.getPointer();
   * const screenPointer = canvas.getPointer(true);
   */
  getPointer(screen?: boolean): Coordinates {
    const { pointer, pointerScreen } = this.canvas.attributes;
    return screen ? pointerScreen : pointer;
  }

  getZoomDecimal() {
    return this.getZoom() / 100;
  }

  getZoomMultiplier() {
    const zoom = this.getZoomDecimal();
    return zoom ? 1 / zoom : 1;
  }

  fitViewport(opts?: FitViewportOptions) {
    this.canvasView?.fitViewport(opts);
  }

  toggleFramesEvents(on: boolean) {
    const { style } = this.getFramesEl();
    style.pointerEvents = on ? '' : 'none';
  }

  getFrames() {
    return this.canvas.frames.map(item => item);
  }

  /**
   * Add new frame to the canvas
   * @param {Object} props Frame properties
   * @returns {[Frame]}
   * @private
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
    return this.canvas.frames.add(new Frame(this, { ...props }), opts);
  }

  /**
   * Get the last created Component from a drag & drop to the canvas.
   * @returns {[Component]|undefined}
   */
  getLastDragResult(): Component | undefined {
    return this.em.get('dragResult');
  }

  /**
   * Add or update canvas spot.
   * @param {Object} props Canvas spot properties.
   * @param opts
   * @returns {[CanvasSpot]}
   * @example
   * // Add new canvas spot
   * const spot = canvas.addSpot({
   *  type: 'select', // 'select' is one of the built-in spots
   *  component: editor.getSelected(),
   * });
   *
   * // Add custom canvas spot
   * const spot = canvas.addSpot({
   *  type: 'my-custom-spot',
   *  component: editor.getSelected(),
   * });
   * // Update the same spot by reusing its ID
   * canvas.addSpot({
   *  id: spot.id,
   *  component: anotherComponent,
   * });
   */
  addSpot<T extends CanvasSpotProps>(props: Omit<T, 'id'> & { id?: string }, opts: AddOptions = {}) {
    const spotProps = props as T;
    const spots = this.getSpots<T>(spotProps);

    if (spots.length) {
      const spot = spots[0];
      spot.set(spotProps);
      return spot;
    }

    const cmpView = spotProps.componentView || spotProps.component?.view;
    const spot = new CanvasSpot<T>(this, {
      ...spotProps,
      id: spotProps.id || `cs_${spotProps.type}_${cmpView?.cid}`,
      type: spotProps.type || '',
    } as T);

    this.spots.add(spot, opts);

    return spot;
  }

  /**
   * Get canvas spots.
   * @param {Object} [spotProps] Canvas spot properties for filtering the result. With no properties, all available spots will be returned.
   * @returns {[CanvasSpot][]}
   * @example
   * canvas.addSpot({ type: 'select', component: cmp1 });
   * canvas.addSpot({ type: 'select', component: cmp2 });
   * canvas.addSpot({ type: 'target', component: cmp3 });
   *
   * // Get all spots
   * const allSpots = canvas.getSpots();
   * allSpots.length; // 3
   *
   * // Get all 'select' spots
   * const allSelectSpots = canvas.getSpots({ type: 'select' });
   * allSelectSpots.length; // 2
   */
  getSpots<T extends CanvasSpotProps>(spotProps: Partial<T> = {}) {
    return this.spots.where(spotProps.id ? { id: spotProps.id } : spotProps) as CanvasSpot<T>[];
  }

  /**
   * Remove canvas spots.
   * @param {Object|[CanvasSpot][]} [spotProps] Canvas spot properties for filtering spots to remove or an array of spots to remove. With no properties, all available spots will be removed.
   * @returns {[CanvasSpot][]}
   * @example
   * canvas.addSpot({ type: 'select', component: cmp1 });
   * canvas.addSpot({ type: 'select', component: cmp2 });
   * canvas.addSpot({ type: 'target', component: cmp3 });
   *
   * // Remove all 'select' spots
   * canvas.removeSpots({ type: 'select' });
   *
   * // Remove spots by an array of canvas spots
   * const filteredSpots = canvas.getSpots().filter(spot => myCustomCondition);
   * canvas.removeSpots(filteredSpots);
   *
   * // Remove all spots
   * canvas.removeSpots();
   */
  removeSpots<T extends CanvasSpotProps>(spotProps: Partial<T> | CanvasSpot[] = {}) {
    const spots = isArray(spotProps) ? spotProps : this.getSpots(spotProps);
    const removed = this.spots.remove(spots);
    return removed as unknown as CanvasSpot<T>[];
  }

  /**
   * Check if the built-in canvas spot has a declared custom rendering.
   * @param {String} type Built-in canvas spot type
   * @returns {Boolean}
   * @example
   * grapesjs.init({
   *  // ...
   *  canvas: {
   *    // avoid rendering the built-in 'target' canvas spot
   *    customSpots: { target: true }
   *  }
   * });
   * // ...
   * canvas.hasCustomSpot('select'); // false
   * canvas.hasCustomSpot('target'); // true
   */
  hasCustomSpot(type?: CanvasSpotBuiltInTypes) {
    const { customSpots } = this.config;

    if (customSpots === true || (customSpots && type && customSpots[type])) {
      return true;
    }

    return false;
  }

  /**
   * Transform a box rect from the world coordinate system to the screen one.
   * @param {Object} boxRect
   * @returns {Object}
   */
  getWorldRectToScreen(boxRect: Parameters<CanvasView['getRectToScreen']>[0]) {
    return this.canvasView?.getRectToScreen(boxRect);
  }

  /**
   * Update canvas for spots/tools positioning.
   * @param {Object} [opts] Options.
   * @param {Object} [opts.spots=false] Update the position of spots.
   */
  refresh(opts: CanvasRefreshOptions = {}) {
    const { em, events, canvasView } = this;
    canvasView?.clearOff();

    if (opts.spots || opts.all) {
      this.refreshSpots();
      em.trigger('canvas:updateTools'); // this should be deprecated
    }

    em.set('canvasOffset', this.getOffset()); // this should be deprecated
    em.trigger(events.refresh, opts);
  }

  refreshSpots() {
    this.spots.refresh();
  }

  destroy() {
    this.canvas.stopListening();
    this.canvasView?.remove();
    //[this.canvas, this.canvasView].forEach(i => (i = {}));
    //@ts-ignore
    ['model', 'droppable'].forEach(i => (this[i] = {}));
  }
}
