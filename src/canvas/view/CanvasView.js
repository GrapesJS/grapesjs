import Backbone from 'backbone';
import { bindAll } from 'underscore';
import {
  on,
  off,
  getElement,
  getKeyChar,
  isTextNode,
  getElRect
} from 'utils/mixins';
import FramesView from './FramesView';

const $ = Backbone.$;
let timerZoom;

export default Backbone.View.extend({
  events: {
    wheel: 'onWheel'
  },

  template() {
    const { pfx } = this;
    return `
      <div class="${pfx}canvas__frames" data-frames></div>
      <div id="${pfx}tools" class="${pfx}canvas__tools" data-tools></div>
    `;
  },

  initialize(o) {
    bindAll(this, 'clearOff', 'onKeyPress', 'onCanvasMove');
    const { model } = this;
    this.config = o.config || {};
    this.em = this.config.em || {};
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.className = this.config.stylePrefix + 'canvas';
    const { em } = this;
    this._initFrames();
    this.listenTo(em, 'change:canvasOffset', this.clearOff);
    this.listenTo(em, 'component:selected', this.checkSelected);
    this.listenTo(model, 'change:zoom change:x change:y', this.updateFrames);
    this.listenTo(model, 'change:frames', this._onFramesUpdate);
    this.toggleListeners(1);
  },

  _onFramesUpdate() {
    this._initFrames();
    this._renderFrames();
  },

  _initFrames() {
    const { frames, model, config, em } = this;
    const collection = model.get('frames');
    em.set('readyCanvas', 0);
    collection.once('loaded:all', () => em.set('readyCanvas', 1));
    frames && frames.remove();
    this.frames = new FramesView({
      collection,
      config: {
        ...config,
        canvasView: this
      }
    });
  },

  checkSelected(component, opts = {}) {
    const { scroll } = opts;
    const currFrame = this.em.get('currentFrame');

    scroll &&
      component.views.forEach(view => {
        view._getFrame() !== currFrame && view.scrollIntoView(scroll);
      });
  },

  remove() {
    this.frames.remove();
    const frm = this.model.get('frames');
    frm.remove(frm.models);
    this.frames = {};
    Backbone.View.prototype.remove.apply(this, arguments);
    this.toggleListeners();
  },

  preventDefault(ev) {
    if (ev) {
      ev.preventDefault();
      ev._parentEvent && ev._parentEvent.preventDefault();
    }
  },

  onCanvasMove(ev) {
    // const data = { x: ev.clientX, y: ev.clientY };
    // const data2 = this.em.get('Canvas').getMouseRelativeCanvas(ev);
    // const data3 = this.em.get('Canvas').getMouseRelativePos(ev);
    // this.em.trigger('canvas:over', data, data2, data3);
  },

  toggleListeners(enable) {
    const { el } = this;
    const fn = enable ? on : off;
    fn(document, 'keypress', this.onKeyPress);
    fn(window, 'scroll resize', this.clearOff);
    // fn(el, 'mousemove dragover', this.onCanvasMove);
  },

  onKeyPress(ev) {
    const { em } = this;
    const key = getKeyChar(ev);

    if (
      key === ' ' &&
      em.getZoomDecimal() !== 1 &&
      !em.get('Canvas').isInputFocused()
    ) {
      this.preventDefault(ev);
      em.get('Editor').runCommand('core:canvas-move');
    }
  },

  onWheel(ev) {
    if ((ev.ctrlKey || ev.metaKey) && this.em.getConfig('multiFrames')) {
      this.preventDefault(ev);
      const { model } = this;
      const delta = Math.max(-1, Math.min(1, ev.wheelDelta || -ev.detail));
      const zoom = model.get('zoom');
      model.set('zoom', zoom + delta * 2);
    }
  },

  updateFrames(ev) {
    const { em, model } = this;
    const { x, y } = model.attributes;
    const zoom = this.getZoom();
    const defOpts = { preserveSelected: 1 };
    const mpl = zoom ? 1 / zoom : 1;
    this.framesArea.style.transform = `scale(${zoom}) translate(${x *
      mpl}px, ${y * mpl}px)`;
    this.clearOff();
    em.stopDefault(defOpts);
    em.trigger('canvas:update', ev);
    timerZoom && clearTimeout(timerZoom);
    timerZoom = setTimeout(() => em.runDefault(defOpts), 300);
  },

  getZoom() {
    return this.em.getZoomDecimal();
  },

  /**
   * Checks if the element is visible in the canvas's viewport
   * @param  {HTMLElement}  el
   * @return {Boolean}
   */
  isElInViewport(el) {
    const elem = getElement(el);
    const rect = getElRect(elem);
    const frameRect = this.getFrameOffset(elem);
    const rTop = rect.top;
    const rLeft = rect.left;
    return (
      rTop >= 0 &&
      rLeft >= 0 &&
      rTop <= frameRect.height &&
      rLeft <= frameRect.width
    );
  },

  /**
   * Get the offset of the element
   * @param  {HTMLElement} el
   * @return {Object}
   */
  offset(el, opts = {}) {
    const rect = getElRect(el);
    const docBody = el.ownerDocument.body;
    const { noScroll } = opts;

    return {
      top: rect.top + (noScroll ? 0 : docBody.scrollTop),
      left: rect.left + (noScroll ? 0 : docBody.scrollLeft),
      width: rect.width,
      height: rect.height
    };
  },

  /**
   * Cleare cached offsets
   * @private
   */
  clearOff() {
    this.frmOff = null;
    this.cvsOff = null;
  },

  /**
   * Return frame offset
   * @return {Object}
   * @private
   */
  getFrameOffset(el) {
    if (!this.frmOff || el) {
      const frame = this.frame.el;
      const winEl = el && el.ownerDocument.defaultView;
      const frEl = winEl ? winEl.frameElement : frame;
      this.frmOff = this.offset(frEl || frame);
    }
    return this.frmOff;
  },

  /**
   * Return canvas offset
   * @return {Object}
   * @private
   */
  getCanvasOffset() {
    if (!this.cvsOff) this.cvsOff = this.offset(this.el);
    return this.cvsOff;
  },

  /**
   * Returns element's rect info
   * @param {HTMLElement} el
   * @return {Object}
   * @private
   */
  getElementPos(el, opts) {
    const zoom = this.getZoom();
    var opt = opts || {};
    var frmOff = this.getFrameOffset(el);
    var cvsOff = this.getCanvasOffset();
    var eo = this.offset(el, opts);

    var frmTop = opt.avoidFrameOffset ? 0 : frmOff.top;
    var frmLeft = opt.avoidFrameOffset ? 0 : frmOff.left;

    const top = eo.top * zoom + frmTop - cvsOff.top;
    const left = eo.left * zoom + frmLeft - cvsOff.left;
    const height = eo.height * zoom;
    const width = eo.width * zoom;

    return { top, left, height, width, zoom, rect: eo };
  },

  /**
   * Returns element's offsets like margins and paddings
   * @param {HTMLElement} el
   * @return {Object}
   * @private
   */
  getElementOffsets(el) {
    if (!el || isTextNode(el)) return {};
    const result = {};
    const styles = window.getComputedStyle(el);
    [
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft'
    ].forEach(offset => {
      result[offset] = parseFloat(styles[offset]) * this.getZoom();
    });

    return result;
  },

  /**
   * Returns position data of the canvas element
   * @return {Object} obj Position object
   * @private
   */
  getPosition(opts = {}) {
    const doc = this.frame.el.contentDocument;
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
      height: co.height
    };
  },

  /**
   * Update javascript of a specific component passed by its View
   * @param {View} view Component's View
   * @private
   */
  updateScript(view) {
    const model = view.model;
    const id = model.getId();

    if (!view.scriptContainer) {
      view.scriptContainer = $(`<div data-id="${id}">`);
      this.getJsContainer().appendChild(view.scriptContainer.get(0));
    }

    view.el.id = id;
    view.scriptContainer.html('');
    // In editor, I make use of setTimeout as during the append process of elements
    // those will not be available immediately, therefore 'item' variable
    const script = document.createElement('script');
    const scriptFn = model.getScriptString();
    const scriptFnStr = model.get('script-props')
      ? scriptFn
      : `function(){\n${scriptFn}\n;}`;
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
      scr && scr.get(0).appendChild(script);
    }, 0);
  },

  /**
   * Get javascript container
   * @private
   */
  getJsContainer(view) {
    const frameView = this.getFrameView(view);
    return frameView && frameView.getJsContainer();
  },

  getFrameView(view) {
    return (view && view._getFrame()) || this.em.get('currentFrame');
  },

  _renderFrames() {
    if (!this.ready) return;
    const { model, frames, em, framesArea } = this;
    const frms = model.get('frames');
    frms.listenToLoad();
    frames.render();
    const mainFrame = frms.at(0);
    const currFrame = mainFrame && mainFrame.view;
    em.setCurrentFrame(currFrame);
    framesArea && framesArea.appendChild(frames.el);
    this.frame = currFrame;
  },

  render() {
    const { el, $el, ppfx, config } = this;
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
    this.hlEl = el.querySelector(`.${ppfx}highlighter`);
    this.badgeEl = el.querySelector(`.${ppfx}badge`);
    this.placerEl = el.querySelector(`.${ppfx}placeholder`);
    this.ghostEl = el.querySelector(`.${ppfx}ghost`);
    this.toolbarEl = el.querySelector(`.${ppfx}toolbar`);
    this.resizerEl = el.querySelector(`.${ppfx}resizer`);
    this.offsetEl = el.querySelector(`.${ppfx}offset-v`);
    this.fixedOffsetEl = el.querySelector(`.${ppfx}offset-fixed-v`);
    this.toolsGlobEl = el.querySelector(`.${ppfx}tools-gl`);
    this.toolsEl = toolsEl;
    this.el.className = this.className;
    this.ready = 1;
    this._renderFrames();

    return this;
  }
});
