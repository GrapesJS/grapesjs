import { bindAll, isNumber } from 'underscore';
import { ModuleView } from '../../abstract';
import { BoxRect, Coordinates, CoordinatesTypes, ElementRect } from '../../common';
import Component from '../../dom_components/model/Component';
import ComponentView from '../../dom_components/view/ComponentView';
import {
  createEl,
  getDocumentScroll,
  getElRect,
  getKeyChar,
  hasModifierKey,
  isTextNode,
  off,
  on,
} from '../../utils/dom';
import { getComponentView, getElement, getUiClass } from '../../utils/mixins';
import Canvas from '../model/Canvas';
import Frame from '../model/Frame';
import { GetBoxRectOptions, ToWorldOption } from '../types';
import FrameView from './FrameView';
import FramesView from './FramesView';

export interface MarginPaddingOffsets {
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
}

export type ElementPosOpts = {
  avoidFrameOffset?: boolean;
  avoidFrameZoom?: boolean;
  noScroll?: boolean;
};

export interface FitViewportOptions {
  frame?: Frame;
  gap?: number | { x: number; y: number };
  ignoreHeight?: boolean;
  el?: HTMLElement;
}

export default class CanvasView extends ModuleView<Canvas> {
  template() {
    const { pfx } = this;
    return `
      <div class="${pfx}canvas__frames" data-frames>
        <div class="${pfx}canvas__spots" data-spots></div>
      </div>
      <div id="${pfx}tools" class="${pfx}canvas__tools" data-tools></div>
      <style data-canvas-style></style>
    `;
  }
  /*get className(){
    return this.pfx + 'canvas':
  }*/
  hlEl?: HTMLElement;
  badgeEl?: HTMLElement;
  placerEl?: HTMLElement;
  ghostEl?: HTMLElement;
  toolbarEl?: HTMLElement;
  resizerEl?: HTMLElement;
  offsetEl?: HTMLElement;
  fixedOffsetEl?: HTMLElement;
  toolsGlobEl?: HTMLElement;
  toolsEl?: HTMLElement;
  framesArea?: HTMLElement;
  toolsWrapper?: HTMLElement;
  spotsEl?: HTMLElement;
  cvStyle?: HTMLElement;
  clsUnscale: string;
  ready = false;

  frames!: FramesView;
  frame?: FrameView;

  private timerZoom?: number;

  private frmOff?: { top: number; left: number; width: number; height: number };
  private cvsOff?: { top: number; left: number; width: number; height: number };

  constructor(model: Canvas) {
    super({ model });
    bindAll(this, 'clearOff', 'onKeyPress', 'onWheel', 'onPointer');
    const { em, pfx, ppfx } = this;
    const { events } = this.module;
    this.className = `${pfx}canvas ${ppfx}no-touch-actions${!em.config.customUI ? ` ${pfx}canvas-bg` : ''}`;
    this.clsUnscale = `${pfx}unscale`;
    this._initFrames();
    this.listenTo(em, events.refresh, this.clearOff);
    this.listenTo(em, 'component:selected', this.checkSelected);
    this.listenTo(em, `${events.coords} ${events.zoom}`, this.updateFrames);
    this.listenTo(model, 'change:frames', this._onFramesUpdate);
    this.toggleListeners(true);
  }

  _onFramesUpdate() {
    this._initFrames();
    this._renderFrames();
  }

  _initFrames() {
    const { frames, model, config, em } = this;
    const collection = model.frames;
    em.set('readyCanvas', 0);
    collection.once('loaded:all', () => em.set('readyCanvas', 1));
    frames?.remove();
    this.frames = new FramesView(
      { collection },
      {
        ...config,
        canvasView: this,
      }
    );
  }

  checkSelected(component: Component, opts: { scroll?: ScrollIntoViewOptions } = {}) {
    const { scroll } = opts;
    const currFrame = this.em.getCurrentFrame();

    scroll &&
      component.views?.forEach(view => {
        view.frameView === currFrame && view.scrollIntoView(scroll);
      });
  }

  remove(...args: any) {
    this.frames?.remove();
    //@ts-ignore
    this.frames = undefined;
    ModuleView.prototype.remove.apply(this, args);
    this.toggleListeners(false);
    return this;
  }

  preventDefault(ev: Event) {
    if (ev) {
      ev.preventDefault();
      (ev as any)._parentEvent?.preventDefault();
    }
  }

  toggleListeners(enable: boolean) {
    const { el, config } = this;
    const fn = enable ? on : off;
    fn(document, 'keypress', this.onKeyPress);
    fn(window, 'scroll resize', this.clearOff);
    fn(el, 'wheel', this.onWheel, { passive: !config.infiniteCanvas });
    fn(el, 'pointermove', this.onPointer);
  }

  screenToWorld(x: number, y: number): Coordinates {
    const { module } = this;
    const coords = module.getCoords();
    const zoom = module.getZoomMultiplier();
    const vwDelta = this.getViewportDelta();

    return {
      x: (x - coords.x - vwDelta.x) * zoom,
      y: (y - coords.y - vwDelta.y) * zoom,
    };
  }

  onPointer(ev: WheelEvent) {
    if (!this.config.infiniteCanvas) return;

    const canvasRect = this.getCanvasOffset();
    const docScroll = getDocumentScroll();
    const screenCoords: Coordinates = {
      x: ev.clientX - canvasRect.left + docScroll.x,
      y: ev.clientY - canvasRect.top + docScroll.y,
    };

    if ((ev as any)._parentEvent) {
      // with _parentEvent means was triggered from the iframe
      const frameRect = (ev.target as HTMLElement).getBoundingClientRect();
      const zoom = this.module.getZoomDecimal();
      screenCoords.x = frameRect.left - canvasRect.left + docScroll.x + ev.clientX * zoom;
      screenCoords.y = frameRect.top - canvasRect.top + docScroll.y + ev.clientY * zoom;
    }

    this.model.set({
      pointerScreen: screenCoords,
      pointer: this.screenToWorld(screenCoords.x, screenCoords.y),
    });
  }

  onKeyPress(ev: KeyboardEvent) {
    const { em } = this;
    const key = getKeyChar(ev);

    if (key === ' ' && em.getZoomDecimal() !== 1 && !em.Canvas.isInputFocused()) {
      this.preventDefault(ev);
      em.Editor.runCommand('core:canvas-move');
    }
  }

  onWheel(ev: WheelEvent) {
    const { module, config } = this;
    if (config.infiniteCanvas) {
      this.preventDefault(ev);
      const { deltaX, deltaY } = ev;
      const zoom = module.getZoomDecimal();
      const isZooming = hasModifierKey(ev);
      const coords = module.getCoords();

      if (isZooming) {
        const newZoom = zoom - deltaY * zoom * 0.01;
        module.setZoom(newZoom * 100);

        // Update coordinates based on pointer
        const pointer = this.model.getPointerCoords(CoordinatesTypes.Screen);
        const canvasRect = this.getCanvasOffset();
        const pointerX = pointer.x - canvasRect.width / 2;
        const pointerY = pointer.y - canvasRect.height / 2;
        const zoomDelta = newZoom / zoom;
        const x = pointerX - (pointerX - coords.x) * zoomDelta;
        const y = pointerY - (pointerY - coords.y) * zoomDelta;
        module.setCoords(x, y);
      } else {
        this.onPointer(ev);
        module.setCoords(coords.x - deltaX, coords.y - deltaY);
      }
    }
  }

  updateFrames(ev: Event) {
    const { em } = this;
    const toolsWrpEl = this.toolsWrapper!;
    const defOpts = { preserveSelected: 1 };
    this.updateFramesArea();
    this.clearOff();
    toolsWrpEl.style.display = 'none';
    em.trigger('canvas:update', ev);
    this.timerZoom && clearTimeout(this.timerZoom);
    this.timerZoom = setTimeout(() => {
      em.stopDefault(defOpts);
      em.runDefault(defOpts);
      toolsWrpEl.style.display = '';
    }, 300) as any;
  }

  updateFramesArea() {
    const { framesArea, model, module, cvStyle, clsUnscale } = this;
    const mpl = module.getZoomMultiplier();

    if (framesArea) {
      const { x, y } = model.attributes;
      const zoomDc = module.getZoomDecimal();

      framesArea.style.transform = `scale(${zoomDc}) translate(${x * mpl}px, ${y * mpl}px)`;
    }

    if (cvStyle) {
      cvStyle.innerHTML = `
        .${clsUnscale} { scale: ${mpl} }
      `;
    }
  }

  fitViewport(opts: FitViewportOptions = {}) {
    const { em, module, model } = this;
    const canvasRect = this.getCanvasOffset();
    const { el } = opts;
    const elFrame = el && getComponentView(el)?.frameView;
    const frame = elFrame ? elFrame.model : opts.frame || em.getCurrentFrameModel() || model.frames.at(0);
    const { x, y } = frame.attributes;
    const boxRect: BoxRect = {
      x: x ?? 0,
      y: y ?? 0,
      width: frame.width,
      height: frame.height,
    };

    if (el) {
      const elRect = this.getElBoxRect(el);
      boxRect.x = boxRect.x + elRect.x;
      boxRect.y = boxRect.y + elRect.y;
      boxRect.width = elRect.width;
      boxRect.height = elRect.height;
    }

    const noHeight = opts.ignoreHeight;
    const gap = opts.gap ?? 0;
    const gapIsNum = isNumber(gap);
    const gapX = gapIsNum ? gap : gap.x;
    const gapY = gapIsNum ? gap : gap.y;
    const boxWidth = boxRect.width + gapX * 2;
    const boxHeight = boxRect.height + gapY * 2;
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;
    const widthRatio = canvasWidth / boxWidth;
    const heightRatio = canvasHeight / boxHeight;

    const zoomRatio = noHeight ? widthRatio : Math.min(widthRatio, heightRatio);
    const zoom = zoomRatio * 100;
    module.setZoom(zoom);

    // check for the frame witdh is necessary as we're centering the frame via CSS
    const coordX = -boxRect.x + (frame.width >= canvasWidth ? canvasWidth / 2 - boxWidth / 2 : -gapX);
    const coordY = -boxRect.y + canvasHeight / 2 - boxHeight / 2;

    const coords = {
      x: (coordX + gapX) * zoomRatio,
      y: (coordY + gapY) * zoomRatio,
    };

    if (noHeight) {
      const zoomMltp = module.getZoomMultiplier();
      const canvasWorldHeight = canvasHeight * zoomMltp;
      const canvasHeightDiff = canvasWorldHeight - canvasHeight;
      const yDelta = canvasHeightDiff / 2;
      coords.y = (-boxRect.y + gapY) * zoomRatio - yDelta / zoomMltp;
    }

    module.setCoords(coords.x, coords.y);
  }

  /**
   * Checks if the element is visible in the canvas's viewport
   * @param  {HTMLElement}  el
   * @return {Boolean}
   */
  isElInViewport(el: HTMLElement) {
    const elem = getElement(el);
    const rect = getElRect(elem);
    const frameRect = this.getFrameOffset(elem);
    const rTop = rect.top;
    const rLeft = rect.left;
    return rTop >= 0 && rLeft >= 0 && rTop <= frameRect.height && rLeft <= frameRect.width;
  }

  /**
   * Get the offset of the element
   * @param  {HTMLElement} el
   * @return { {top: number, left: number, width: number, height: number} }
   */
  offset(el?: HTMLElement, opts: ElementPosOpts = {}) {
    const { noScroll } = opts;
    const rect = getElRect(el);
    const scroll = noScroll ? { x: 0, y: 0 } : getDocumentScroll(el);

    return {
      top: rect.top + scroll.y,
      left: rect.left + scroll.x,
      width: rect.width,
      height: rect.height,
    };
  }

  getRectToScreen(boxRect: Partial<BoxRect>): BoxRect {
    const zoom = this.module.getZoomDecimal();
    const coords = this.module.getCoords();
    const vwDelta = this.getViewportDelta();
    const x = (boxRect.x ?? 0) * zoom + coords.x + vwDelta.x || 0;
    const y = (boxRect.y ?? 0) * zoom + coords.y + vwDelta.y || 0;

    return {
      x,
      y,
      width: (boxRect.width ?? 0) * zoom,
      height: (boxRect.height ?? 0) * zoom,
    };
  }

  getElBoxRect(el: HTMLElement, opts: GetBoxRectOptions = {}): BoxRect {
    const { module } = this;
    const { width, height, left, top } = getElRect(el);
    const frameView = getComponentView(el)?.frameView;
    const frameRect = frameView?.getBoxRect();
    const zoomMlt = module.getZoomMultiplier();
    const frameX = frameRect?.x ?? 0;
    const frameY = frameRect?.y ?? 0;
    const canvasEl = this.el;
    const docScroll = getDocumentScroll();
    const xWithFrame = left + frameX + (canvasEl.scrollLeft + docScroll.x) * zoomMlt;
    const yWithFrame = top + frameY + (canvasEl.scrollTop + docScroll.y) * zoomMlt;
    const boxRect = {
      x: xWithFrame,
      y: yWithFrame,
      width,
      height,
    };

    if (opts.local) {
      boxRect.x = left;
      boxRect.y = top;
    }

    return opts.toScreen ? this.getRectToScreen(boxRect) : boxRect;
  }

  getViewportRect(opts: ToWorldOption = {}): BoxRect {
    const { top, left, width, height } = this.getCanvasOffset();
    const { module } = this;

    if (opts.toWorld) {
      const zoom = module.getZoomMultiplier();
      const coords = module.getCoords();
      const vwDelta = this.getViewportDelta();
      const x = -coords.x - vwDelta.x || 0;
      const y = -coords.y - vwDelta.y || 0;

      return {
        x: x * zoom,
        y: y * zoom,
        width: width * zoom,
        height: height * zoom,
      };
    } else {
      return {
        x: left,
        y: top,
        width,
        height,
      };
    }
  }

  getViewportDelta(opts: { withZoom?: number } = {}): Coordinates {
    const zoom = this.module.getZoomMultiplier();
    const { width, height } = this.getCanvasOffset();
    const worldWidth = width * zoom;
    const worldHeight = height * zoom;
    const widthDelta = worldWidth - width;
    const heightDelta = worldHeight - height;

    return {
      x: widthDelta / 2 / zoom,
      y: heightDelta / 2 / zoom,
    };
  }

  /**
   * Cleare cached offsets
   * @private
   */
  clearOff() {
    this.frmOff = undefined;
    this.cvsOff = undefined;
  }

  /**
   * Return frame offset
   * @return { {top: number, left: number, width: number, height: number} }
   * @public
   */
  getFrameOffset(el?: HTMLElement) {
    if (!this.frmOff || el) {
      const frame = this.frame?.el;
      const winEl = el?.ownerDocument.defaultView;
      const frEl = winEl ? (winEl.frameElement as HTMLElement) : frame;
      this.frmOff = this.offset(frEl || frame);
    }
    return this.frmOff;
  }

  /**
   * Return canvas offset
   * @return { {top: number, left: number, width: number, height: number} }
   * @public
   */
  getCanvasOffset() {
    if (!this.cvsOff) this.cvsOff = this.offset(this.el);
    return this.cvsOff;
  }

  /**
   * Returns element's rect info
   * @param {HTMLElement} el
   * @param {object} opts
   * @return { {top: number, left: number, width: number, height: number, zoom: number, rect: any} }
   * @public
   */
  getElementPos(el: HTMLElement, opts: ElementPosOpts = {}) {
    const zoom = this.module.getZoomDecimal();
    const frameOffset = this.getFrameOffset(el);
    const canvasEl = this.el;
    const canvasOffset = this.getCanvasOffset();
    const elRect = this.offset(el, opts);
    const frameTop = opts.avoidFrameOffset ? 0 : frameOffset.top;
    const frameLeft = opts.avoidFrameOffset ? 0 : frameOffset.left;

    const elTop = opts.avoidFrameZoom ? elRect.top : elRect.top * zoom;
    const elLeft = opts.avoidFrameZoom ? elRect.left : elRect.left * zoom;

    const top = opts.avoidFrameOffset ? elTop : elTop + frameTop - canvasOffset.top + canvasEl.scrollTop;
    const left = opts.avoidFrameOffset ? elLeft : elLeft + frameLeft - canvasOffset.left + canvasEl.scrollLeft;
    const height = opts.avoidFrameZoom ? elRect.height : elRect.height * zoom;
    const width = opts.avoidFrameZoom ? elRect.width : elRect.width * zoom;

    return { top, left, height, width, zoom, rect: elRect };
  }

  /**
   * Returns element's offsets like margins and paddings
   * @param {HTMLElement} el
   * @return { MarginPaddingOffsets }
   * @public
   */
  getElementOffsets(el: HTMLElement) {
    if (!el || isTextNode(el)) return {};
    const result: MarginPaddingOffsets = {};
    const styles = window.getComputedStyle(el);
    const zoom = this.module.getZoomDecimal();
    const marginPaddingOffsets: (keyof MarginPaddingOffsets)[] = [
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'borderTopWidth',
      'borderRightWidth',
      'borderBottomWidth',
      'borderLeftWidth',
    ];
    marginPaddingOffsets.forEach(offset => {
      result[offset] = parseFloat(styles[offset]) * zoom;
    });

    return result;
  }

  /**
   * Returns position data of the canvas element
   * @return { {top: number, left: number, width: number, height: number} } obj Position object
   * @public
   */
  getPosition(opts: any = {}): ElementRect {
    const doc = this.frame?.el.contentDocument;
    if (!doc) {
      return {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      };
    }
    const bEl = doc.body;
    const zoom = this.module.getZoomDecimal();
    const fo = this.getFrameOffset();
    const co = this.getCanvasOffset();
    const { noScroll } = opts;

    return {
      top: fo.top + (noScroll ? 0 : bEl.scrollTop) * zoom - co.top,
      left: fo.left + (noScroll ? 0 : bEl.scrollLeft) * zoom - co.left,
      width: co.width,
      height: co.height,
    };
  }

  /**
   * Update javascript of a specific component passed by its View
   * @param {ModuleView} view Component's View
   * @private
   */
  //TODO change type after the ComponentView was updated to ts
  updateScript(view: any) {
    const model = view.model;
    const id = model.getId();

    if (!view.scriptContainer) {
      view.scriptContainer = createEl('div', { 'data-id': id });
      const jsEl = this.getJsContainer();
      jsEl?.appendChild(view.scriptContainer);
    }

    view.el.id = id;
    view.scriptContainer.innerHTML = '';
    // In editor, I make use of setTimeout as during the append process of elements
    // those will not be available immediately, therefore 'item' variable
    const script = document.createElement('script');
    const scriptFn = model.getScriptString();
    const scriptFnStr = model.get('script-props') ? scriptFn : `function(){\n${scriptFn}\n;}`;
    const scriptProps = JSON.stringify(model.__getScriptProps());
    script.innerHTML = `
      setTimeout(function() {
        var item = document.getElementById('${id}');
        if (!item) return;
        (${scriptFnStr}.bind(item))(${scriptProps})
      }, 1);`;
    // #873
    // Adding setTimeout will make js components work on init of the editor
    setTimeout(() => {
      const scr = view.scriptContainer;
      scr?.appendChild(script);
    }, 0);
  }

  /**
   * Get javascript container
   * @private
   */
  getJsContainer(view?: ComponentView) {
    const frameView = this.getFrameView(view);
    return frameView?.getJsContainer();
  }

  getFrameView(view?: ComponentView) {
    return view?.frameView || this.em.getCurrentFrame();
  }

  _renderFrames() {
    if (!this.ready) return;
    const { model, frames, em, framesArea } = this;
    const frms = model.frames;
    frms.listenToLoad();
    frames.render();
    const mainFrame = frms.at(0);
    const currFrame = mainFrame?.view;
    em.setCurrentFrame(currFrame);
    framesArea?.appendChild(frames.el);
    this.frame = currFrame;
    this.updateFramesArea();
  }

  renderFrames() {
    this._renderFrames();
  }

  render() {
    const { el, $el, ppfx, config, em } = this;
    $el.html(this.template());
    const $frames = $el.find('[data-frames]');
    this.framesArea = $frames.get(0);

    const toolsWrp = $el.find('[data-tools]');
    this.toolsWrapper = toolsWrp.get(0);
    toolsWrp.append(`
      <div class="${ppfx}tools ${ppfx}tools-gl" style="pointer-events:none">
        <div class="${ppfx}placeholder">
          <div class="${ppfx}placeholder-int"></div>
        </div>
      </div>
      <div id="${ppfx}tools" style="pointer-events:none">
        ${config.extHl ? `<div class="${ppfx}highlighter-sel"></div>` : ''}
        <div class="${ppfx}badge"></div>
        <div class="${ppfx}ghost"></div>
        <div class="${ppfx}toolbar" style="pointer-events:all"></div>
        <div class="${ppfx}resizer"></div>
        <div class="${ppfx}offset-v"></div>
        <div class="${ppfx}offset-fixed-v"></div>
      </div>
    `);
    this.toolsEl = el.querySelector(`#${ppfx}tools`)!;
    this.hlEl = el.querySelector(`.${ppfx}highlighter`)!;
    this.badgeEl = el.querySelector(`.${ppfx}badge`)!;
    this.placerEl = el.querySelector(`.${ppfx}placeholder`)!;
    this.ghostEl = el.querySelector(`.${ppfx}ghost`)!;
    this.toolbarEl = el.querySelector(`.${ppfx}toolbar`)!;
    this.resizerEl = el.querySelector(`.${ppfx}resizer`)!;
    this.offsetEl = el.querySelector(`.${ppfx}offset-v`)!;
    this.fixedOffsetEl = el.querySelector(`.${ppfx}offset-fixed-v`)!;
    this.toolsGlobEl = el.querySelector(`.${ppfx}tools-gl`)!;
    this.spotsEl = el.querySelector('[data-spots]')!;
    this.cvStyle = el.querySelector('[data-canvas-style]')!;
    this.el.className = getUiClass(em, this.className);
    this.ready = true;
    this._renderFrames();

    return this;
  }
}
