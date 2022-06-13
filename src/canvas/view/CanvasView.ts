import { bindAll } from 'underscore';
import { View } from '../../abstract';
import { on, off, getElement, getKeyChar, isTextNode, getElRect, getUiClass } from '../../utils/mixins';
import { createEl } from '../../utils/dom';
import FramesView from './FramesView';
import Canvas from '../model/Canvas';
import FrameView from './FrameView';
import ComponentView from '../../dom_components/view/ComponentView';
import Component from '../../dom_components/model/Component';

interface MarginPaddingOffsets{
   marginTop?: number,
   marginRight?: number,
   marginBottom?: number,
   marginLeft?: number,
   paddingTop?: number,
   paddingRight?: number,
   paddingBottom?: number,
   paddingLeft?: number,
  }
export default class CanvasView extends View<Canvas> {
  events() {
    return {
      wheel: 'onWheel',
    };
  }

  template() {
    const { pfx } = this;
    return `
      <div class="${pfx}canvas__frames" data-frames></div>
      <div id="${pfx}tools" class="${pfx}canvas__tools" data-tools></div>
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
  ready = false;

  frames!: FramesView;
  frame?: FrameView;

  private timerZoom?: number

  private frmOff?: {top: number, left: number, width: number, height: number}
  private cvsOff?: {top: number, left: number, width: number, height: number}

  constructor(model: Canvas) {
    super({model});
    bindAll(this, 'clearOff', 'onKeyPress', 'onCanvasMove');
    this.className = this.pfx + 'canvas';
    const { em } = this;
    this._initFrames();
    this.listenTo(em, 'change:canvasOffset', this.clearOff);
    this.listenTo(em, 'component:selected', this.checkSelected);
    this.listenTo(model, 'change:zoom change:x change:y', this.updateFrames);
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
      {collection},
      {
        ...config,
        canvasView: this,
      },
    );
  }

  checkSelected(component: Component, opts: any = {}) {
    const { scroll } = opts;
    const currFrame = this.em.get('currentFrame');

    scroll && component.views?.forEach(view => {
        view._getFrame() === currFrame && view.scrollIntoView(scroll);
      });
  }

  remove(...args: any) {
    this.frames?.remove();
    //@ts-ignore
    this.frames = undefined;
    View.prototype.remove.apply(this, args);
    this.toggleListeners(false);
    return this
  }

  preventDefault(ev: Event) {
    if (ev) {
      ev.preventDefault();
      //@ts-ignore
      ev._parentEvent?.preventDefault();
    }
  }

  onCanvasMove(ev: Event) {
    // const data = { x: ev.clientX, y: ev.clientY };
    // const data2 = this.em.get('Canvas').getMouseRelativeCanvas(ev);
    // const data3 = this.em.get('Canvas').getMouseRelativePos(ev);
    // this.em.trigger('canvas:over', data, data2, data3);
  }

  toggleListeners(enable: boolean) {
    const { el } = this;
    const fn = enable ? on : off;
    // @ts-ignore
    fn(document, 'keypress', this.onKeyPress);
    fn(window, 'scroll resize', this.clearOff);
    // fn(el, 'mousemove dragover', this.onCanvasMove);
  }

  onKeyPress(ev: KeyboardEvent) {
    const { em } = this;
    const key = getKeyChar(ev);

    if (key === ' ' && em.getZoomDecimal() !== 1 && !em.get('Canvas').isInputFocused()) {
      this.preventDefault(ev);
      em.get('Editor').runCommand('core:canvas-move');
    }
  }

  onWheel(ev: KeyboardEvent) {
    if ((ev.ctrlKey || ev.metaKey) && this.em.getConfig().multiFrames) {
      this.preventDefault(ev);
      const { model } = this;
      //@ts-ignore this is potentially deprecated
      const delta = Math.max(-1, Math.min(1, ev.wheelDelta || -ev.detail));
      const zoom = model.get('zoom');
      model.set('zoom', zoom + delta * 2);
    }
  }

  updateFrames(ev: Event) {
    const { em, model } = this;
    const { x, y } = model.attributes;
    const zoom = this.getZoom();
    const defOpts = { preserveSelected: 1 };
    const mpl = zoom ? 1 / zoom : 1;
    //@ts-ignore
    this.framesArea.style.transform = `scale(${zoom}) translate(${x * mpl}px, ${y * mpl}px)`;
    this.clearOff();
    em.stopDefault(defOpts);
    em.trigger('canvas:update', ev);
    this.timerZoom && clearTimeout(this.timerZoom);
    this.timerZoom = setTimeout(() => em.runDefault(defOpts), 300) as any;
  }

  getZoom() {
    return this.em.getZoomDecimal();
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
  offset(el?: HTMLElement, opts: any = {}) {
    const rect = getElRect(el);
    const docBody = el?.ownerDocument.body;
    const { noScroll } = opts;

    return {
      top: rect.top + (noScroll ? 0 : docBody?.scrollTop ?? 0),
      left: rect.left + (noScroll ? 0 : docBody?.scrollLeft ?? 0),
      width: rect.width,
      height: rect.height,
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
      const frEl = winEl ? winEl.frameElement as HTMLElement : frame;
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
   * @return { {top: number, left: number, width: number, height: number, zoom: number, rect: any} }
   * @public
   */
  getElementPos(el: HTMLElement, opts: any = {}) {
    const zoom = this.getZoom();
    const opt = opts || {};
    const frameOffset = this.getFrameOffset(el);
    const canvasEl = this.el;
    const canvasOffset = this.getCanvasOffset();
    const elRect = this.offset(el, opts);
    const frameTop = opt.avoidFrameOffset ? 0 : frameOffset.top;
    const frameLeft = opt.avoidFrameOffset ? 0 : frameOffset.left;

    const top = elRect.top * zoom + frameTop - canvasOffset.top + canvasEl.scrollTop;
    const left = elRect.left * zoom + frameLeft - canvasOffset.left + canvasEl.scrollLeft;
    const height = elRect.height * zoom;
    const width = elRect.width * zoom;

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
    const result: MarginPaddingOffsets = {} ;
    const styles = window.getComputedStyle(el);
    const marginPaddingOffsets: (keyof MarginPaddingOffsets)[] =[
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
    ]
    marginPaddingOffsets.forEach(offset => {
      result[offset] = parseFloat(styles[offset]) * this.getZoom();
    });

    return result;
  }

  /**
   * Returns position data of the canvas element
   * @return { {top: number, left: number, width: number, height: number} } obj Position object
   * @public
   */
  getPosition(opts: any = {}) {

    const doc = this.frame?.el.contentDocument;
    if (!doc) return;
    const bEl = doc.body;
    const zoom = this.getZoom();
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
   * @param {View} view Component's View
   * @private
   */
  //TODO change type after the ComponentView was updated to ts
  updateScript(view: any) {
    const model = view.model;
    const id = model.getId();

    if (!view.scriptContainer) {
      view.scriptContainer = createEl('div', { 'data-id': id });
      this.getJsContainer().appendChild(view.scriptContainer);
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
    return frameView && frameView.getJsContainer();
  }

  getFrameView(view?: ComponentView) {
    return view?._getFrame() || this.em.get('currentFrame');
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
    const toolsEl = el.querySelector(`#${ppfx}tools`);
    this.hlEl = el.querySelector(`.${ppfx}highlighter`) as HTMLElement;
    this.badgeEl = el.querySelector(`.${ppfx}badge`) as HTMLElement;
    this.placerEl = el.querySelector(`.${ppfx}placeholder`) as HTMLElement;
    this.ghostEl = el.querySelector(`.${ppfx}ghost`) as HTMLElement;
    this.toolbarEl = el.querySelector(`.${ppfx}toolbar`) as HTMLElement;
    this.resizerEl = el.querySelector(`.${ppfx}resizer`) as HTMLElement;
    this.offsetEl = el.querySelector(`.${ppfx}offset-v`) as HTMLElement;
    this.fixedOffsetEl = el.querySelector(`.${ppfx}offset-fixed-v`) as HTMLElement;
    this.toolsGlobEl = el.querySelector(`.${ppfx}tools-gl`) as HTMLElement;
    this.toolsEl = toolsEl as HTMLElement;
    this.el.className = getUiClass(em, this.className);
    this.ready = true;
    this._renderFrames();

    return this;
  }
}
