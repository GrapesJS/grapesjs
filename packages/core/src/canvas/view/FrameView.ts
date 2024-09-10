import { bindAll, debounce, isString, isUndefined } from 'underscore';
import { ModuleView } from '../../abstract';
import { BoxRect, ObjectAny } from '../../common';
import CssRulesView from '../../css_composer/view/CssRulesView';
import ComponentWrapperView from '../../dom_components/view/ComponentWrapperView';
import ComponentView from '../../dom_components/view/ComponentView';
import { type as typeHead } from '../../dom_components/model/ComponentHead';
import Droppable from '../../utils/Droppable';
import {
  append,
  appendVNodes,
  createCustomEvent,
  createEl,
  getPointerEvent,
  motionsEv,
  off,
  on,
} from '../../utils/dom';
import { hasDnd, setViewEl } from '../../utils/mixins';
import Canvas from '../model/Canvas';
import Frame from '../model/Frame';
import FrameWrapView from './FrameWrapView';
import CanvasEvents from '../types';

export default class FrameView extends ModuleView<Frame, HTMLIFrameElement> {
  /** @ts-ignore */
  get tagName() {
    return 'iframe';
  }
  /** @ts-ignore */
  get attributes() {
    return { allowfullscreen: 'allowfullscreen' };
  }

  dragging = false;
  loaded = false;
  droppable?: Droppable;
  rect?: DOMRect;

  lastClientY?: number;
  lastMaxHeight = 0;
  private jsContainer?: HTMLElement;
  private tools: { [key: string]: HTMLElement } = {};
  private wrapper?: ComponentWrapperView;
  private headView?: ComponentView;
  private frameWrapView?: FrameWrapView;

  constructor(model: Frame, view?: FrameWrapView) {
    super({ model });
    bindAll(this, 'updateClientY', 'stopAutoscroll', 'autoscroll', '_emitUpdate');
    const { el } = this;
    //@ts-ignore
    this.module._config = {
      ...(this.config || {}),
      //@ts-ignore
      frameView: this,
      //canvasView: view?.cv
    };
    this.frameWrapView = view;
    this.showGlobalTools = debounce(this.showGlobalTools.bind(this), 50);
    const cvModel = this.getCanvasModel();
    this.listenTo(model, 'change:head', this.updateHead);
    this.listenTo(cvModel, 'change:styles', this.renderStyles);
    model.view = this;
    setViewEl(el, this);
  }

  getBoxRect(): BoxRect {
    const { el, module } = this;
    const canvasView = module.getCanvasView();
    const coords = module.getCoords();
    const frameRect = el.getBoundingClientRect();
    const canvasRect = canvasView.getCanvasOffset();
    const vwDelta = canvasView.getViewportDelta();
    const zoomM = module.getZoomMultiplier();
    const x = (frameRect.x - canvasRect.left - vwDelta.x - coords.x) * zoomM;
    const y = (frameRect.y - canvasRect.top - vwDelta.y - coords.y) * zoomM;
    const width = frameRect.width * zoomM;
    const height = frameRect.height * zoomM;

    return {
      x,
      y,
      width,
      height,
    };
  }

  /**
   * Update `<head>` content of the frame
   */
  updateHead() {
    const { model } = this;
    const headEl = this.getHead();
    const toRemove: any[] = [];
    const toAdd: any[] = [];
    const current = model.head;
    const prev = model.previous('head');
    const attrStr = (attr: any = {}) =>
      Object.keys(attr)
        .sort()
        .map((i) => `[${i}="${attr[i]}"]`)
        .join('');
    const find = (items: any[], stack: any[], res: any[]) => {
      items.forEach((item) => {
        const { tag, attributes } = item;
        const has = stack.some((s) => s.tag === tag && attrStr(s.attributes) === attrStr(attributes));
        !has && res.push(item);
      });
    };
    find(current, prev, toAdd);
    find(prev, current, toRemove);
    toRemove.forEach((stl) => {
      const el = headEl.querySelector(`${stl.tag}${attrStr(stl.attributes)}`);
      el?.parentNode?.removeChild(el);
    });
    appendVNodes(headEl, toAdd);
  }

  getEl() {
    return this.el;
  }

  getCanvasModel(): Canvas {
    return this?.em.Canvas?.getModel();
  }

  getWindow() {
    return this.getEl().contentWindow as Window;
  }

  getDoc() {
    return this.getEl().contentDocument as Document;
  }

  getHead() {
    return this.getDoc().querySelector('head') as HTMLHeadElement;
  }

  getBody() {
    return this.getDoc().querySelector('body') as HTMLBodyElement;
  }

  getWrapper() {
    return this.getBody().querySelector('[data-gjs-type=wrapper]') as HTMLElement;
  }

  getJsContainer() {
    if (!this.jsContainer) {
      this.jsContainer = createEl('div', { class: `${this.ppfx}js-cont` });
    }

    return this.jsContainer;
  }

  getToolsEl() {
    return this.frameWrapView?.elTools as HTMLElement;
  }

  getGlobalToolsEl() {
    return this.em.Canvas.getGlobalToolsEl()!;
  }

  getHighlighter() {
    return this._getTool('[data-hl]');
  }

  getBadgeEl() {
    return this._getTool('[data-badge]');
  }

  getOffsetViewerEl() {
    return this._getTool('[data-offset]');
  }

  getRect() {
    if (!this.rect) {
      this.rect = this.el.getBoundingClientRect();
    }

    return this.rect;
  }

  /**
   * Get rect data, not affected by the canvas zoom
   */
  getOffsetRect() {
    const { el } = this;
    const { scrollTop, scrollLeft } = this.getBody();
    const height = el.offsetHeight;
    const width = el.offsetWidth;

    return {
      top: el.offsetTop,
      left: el.offsetLeft,
      height,
      width,
      scrollTop,
      scrollLeft,
      scrollBottom: scrollTop + height,
      scrollRight: scrollLeft + width,
    };
  }

  _getTool(name: string) {
    const { tools } = this;
    const toolsEl = this.getToolsEl();

    if (!tools[name]) {
      tools[name] = toolsEl.querySelector(name) as HTMLElement;
    }

    return tools[name];
  }

  remove(...args: any) {
    this._toggleEffects(false);
    this.tools = {};
    this.wrapper?.remove();
    ModuleView.prototype.remove.apply(this, args);
    return this;
  }

  startAutoscroll() {
    this.lastMaxHeight = this.getWrapper().offsetHeight - this.el.offsetHeight;

    // By detaching those from the stack avoid browsers lags
    // Noticeable with "fast" drag of blocks
    setTimeout(() => {
      this._toggleAutoscrollFx(true);
      requestAnimationFrame(this.autoscroll);
    }, 0);
  }

  autoscroll() {
    if (this.dragging) {
      const { lastClientY } = this;
      const canvas = this.em.Canvas;
      const win = this.getWindow();
      const actualTop = win.pageYOffset;
      const clientY = lastClientY || 0;
      const limitTop = canvas.getConfig().autoscrollLimit!;
      const limitBottom = this.getRect().height - limitTop;
      let nextTop = actualTop;

      if (clientY < limitTop) {
        nextTop -= limitTop - clientY;
      }

      if (clientY > limitBottom) {
        nextTop += clientY - limitBottom;
      }

      if (
        !isUndefined(lastClientY) && // Fixes #3134
        nextTop !== actualTop &&
        nextTop > 0 &&
        nextTop < this.lastMaxHeight
      ) {
        const toolsEl = this.getGlobalToolsEl();
        toolsEl.style.opacity = '0';
        this.showGlobalTools();
        win.scrollTo(0, nextTop);
        canvas.spots.refreshDbn();
      }

      requestAnimationFrame(this.autoscroll);
    }
  }

  updateClientY(ev: Event) {
    ev.preventDefault();
    this.lastClientY = getPointerEvent(ev).clientY * this.em.getZoomDecimal();
  }

  showGlobalTools() {
    this.getGlobalToolsEl().style.opacity = '';
  }

  stopAutoscroll() {
    this.dragging && this._toggleAutoscrollFx(false);
  }

  _toggleAutoscrollFx(enable: boolean) {
    this.dragging = enable;
    const win = this.getWindow();
    const method = enable ? 'on' : 'off';
    const mt = { on, off };
    mt[method](win, 'mousemove dragover', this.updateClientY);
    mt[method](win, 'mouseup', this.stopAutoscroll);
  }

  render() {
    const { $el, ppfx, em } = this;
    $el.attr({ class: `${ppfx}frame` });
    this.renderScripts();
    em.trigger('frame:render', this); // deprecated
    return this;
  }

  renderScripts() {
    const { el, model, em } = this;
    const evLoad = 'frame:load';
    const evOpts: ObjectAny = { el, model, view: this };
    const canvas = this.getCanvasModel();
    const appendScript = (scripts: any[]) => {
      if (scripts.length > 0) {
        const src = scripts.shift();
        const scriptEl = createEl('script', {
          type: 'text/javascript',
          ...(isString(src) ? { src } : src),
        });
        el.contentDocument?.head.appendChild(scriptEl);

        if (scriptEl.hasAttribute('nomodule') && 'noModule' in HTMLScriptElement.prototype) {
          appendScript(scripts);
        } else {
          scriptEl.onerror = scriptEl.onload = appendScript.bind(null, scripts);
        }
      } else {
        em?.trigger(CanvasEvents.frameLoadHead, evOpts);
        this.renderBody();
        em?.trigger(CanvasEvents.frameLoadBody, evOpts);
        em?.trigger(evLoad, evOpts); // deprecated
      }
    };

    el.onload = () => {
      const { frameContent } = this.config;
      if (frameContent) {
        const doc = this.getDoc();
        doc.open();
        doc.write(frameContent);
        doc.close();
      }
      evOpts.window = this.getWindow();
      em?.trigger(`${evLoad}:before`, evOpts); // deprecated
      em?.trigger(CanvasEvents.frameLoad, evOpts);
      this.renderHead();
      appendScript([...canvas.get('scripts')]);
    };
  }

  renderStyles(opts: any = {}) {
    const head = this.getHead();
    const canvas = this.getCanvasModel();
    const normalize = (stls: any[] = []) =>
      stls.map((href) => ({
        tag: 'link',
        attributes: {
          rel: 'stylesheet',
          ...(isString(href) ? { href } : href),
        },
      }));
    const prevStyles = normalize(opts.prev || canvas.previous('styles'));
    const styles = normalize(canvas?.get('styles'));
    const toRemove: any[] = [];
    const toAdd: any[] = [];
    const find = (items: any[], stack: any[], res: any[]) => {
      items.forEach((item) => {
        const { href } = item.attributes;
        const has = stack.some((s) => s.attributes.href === href);
        !has && res.push(item);
      });
    };
    find(styles, prevStyles, toAdd);
    find(prevStyles, styles, toRemove);
    toRemove.forEach((stl) => {
      const el = head.querySelector(`link[href="${stl.attributes.href}"]`);
      el?.parentNode?.removeChild(el);
    });
    appendVNodes(head, toAdd);
  }

  renderHead() {
    const { model, em } = this;
    const { root } = model;
    const HeadView = em?.Components?.getType(typeHead)!.view;
    if (!HeadView) return;
    this.headView = new HeadView({
      el: this.getHead(),
      model: root.head,
      config: {
        ...root.config,
        frameView: this,
      },
    }).render();
  }

  renderBody() {
    const { config, em, model, ppfx } = this;
    const doc = this.getDoc();
    const body = this.getBody();
    const win = this.getWindow();
    const hasAutoHeight = model.hasAutoHeight();
    const conf = em.config;
    //@ts-ignore This could be used inside component-related scripts to check if the
    // script is executed inside the editor.
    win._isEditor = true;
    this.renderStyles({ prev: [] });

    const colorWarn = '#ffca6f';

    append(
      body,
      `<style>
      ${conf.baseCss || config.frameStyle || ''}

      ${hasAutoHeight ? 'body { overflow: hidden }' : ''}

      [data-gjs-type="wrapper"] {
        ${!hasAutoHeight ? 'min-height: 100vh;' : ''}
        padding-top: 0.001em;
      }

      .${ppfx}dashed *[data-gjs-highlightable] {
        outline: 1px dashed rgba(170,170,170,0.7);
        outline-offset: -2px;
      }

      .${ppfx}selected {
        outline: 2px solid #3b97e3 !important;
        outline-offset: -2px;
      }

      .${ppfx}selected-parent {
        outline: 2px solid ${colorWarn} !important
      }

      .${ppfx}no-select {
        user-select: none;
        -webkit-user-select:none;
        -moz-user-select: none;
      }

      .${ppfx}freezed {
        opacity: 0.5;
        pointer-events: none;
      }

      .${ppfx}no-pointer {
        pointer-events: none;
      }

      .${ppfx}pointer-init {
        pointer-events: initial;
      }

      .${ppfx}plh-image {
        background: #f5f5f5;
        border: none;
        height: 100px;
        width: 100px;
        display: block;
        outline: 3px solid #ffca6f;
        cursor: pointer;
        outline-offset: -2px
      }

      .${ppfx}grabbing {
        cursor: grabbing;
        cursor: -webkit-grabbing;
      }

      .${ppfx}is__grabbing {
        overflow-x: hidden;
      }

      .${ppfx}is__grabbing,
      .${ppfx}is__grabbing * {
        cursor: grabbing !important;
      }

      ${conf.canvasCss || ''}
      ${conf.protectedCss || ''}
    </style>`,
    );
    const { root } = model;
    const { view } = em?.Components?.getType('wrapper') || {};

    if (!view) return;
    this.wrapper = new view({
      model: root,
      config: {
        ...root.config,
        em,
        frameView: this,
      },
    }).render();
    append(body, this.wrapper?.el!);
    append(
      body,
      new CssRulesView({
        collection: model.getStyles(),
        //@ts-ignore
        config: {
          ...em.Css.getConfig(),
          frameView: this,
        },
      }).render().el,
    );
    append(body, this.getJsContainer());
    // em.trigger('loaded'); // I need to manage only the first one maybe
    //this.updateOffset(); // TOFIX (check if I need it)

    // Avoid some default behaviours
    //@ts-ignore
    on(body, 'click', (ev) => ev && ev.target?.tagName == 'A' && ev.preventDefault());
    on(body, 'submit', (ev) => ev && ev.preventDefault());

    // When the iframe is focused the event dispatcher is not the same so
    // I need to delegate all events to the parent document
    [
      { event: 'keydown keyup keypress', class: 'KeyboardEvent' },
      { event: 'mousedown mousemove mouseup', class: 'MouseEvent' },
      { event: 'pointerdown pointermove pointerup', class: 'PointerEvent' },
      { event: 'wheel', class: 'WheelEvent', opts: { passive: !config.infiniteCanvas } },
    ].forEach((obj) =>
      obj.event.split(' ').forEach((event) => {
        doc.addEventListener(event, (ev) => this.el.dispatchEvent(createCustomEvent(ev, obj.class)), obj.opts);
      }),
    );

    this._toggleEffects(true);

    if (hasDnd(em)) {
      this.droppable = new Droppable(em, this.wrapper?.el);
    }

    this.loaded = true;
    model.trigger('loaded');
  }

  _toggleEffects(enable: boolean) {
    const method = enable ? on : off;
    const win = this.getWindow();
    win && method(win, `${motionsEv} resize`, this._emitUpdate);
  }

  _emitUpdate() {
    this.model._emitUpdated();
  }
}
