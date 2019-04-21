import Backbone from 'backbone';
import {
  on,
  off,
  getElement,
  getKeyChar,
  isTextNode,
  getElRect
} from 'utils/mixins';
const FrameView = require('./FrameView');
const $ = Backbone.$;
let timerZoom;

module.exports = Backbone.View.extend({
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
    _.bindAll(this, 'renderBody', 'onFrameScroll', 'clearOff', 'onKeyPress');
    on(window, 'scroll resize', this.clearOff);
    const { model } = this;
    this.config = o.config || {};
    this.em = this.config.em || {};
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.className = this.config.stylePrefix + 'canvas';
    this.listenTo(this.em, 'change:canvasOffset', this.clearOff);
    this.listenTo(model, 'change:zoom change:x change:y', this.updateFrames);
    this.toggleListeners(1);
    this.frame = new FrameView({
      model: this.model.get('frame'),
      config: this.config
    });
  },

  remove() {
    Backbone.View.prototype.remove.apply(this, arguments);
    this.toggleListeners();
  },

  preventDefault(ev) {
    if (ev) {
      ev.preventDefault();
      ev._parentEvent && ev._parentEvent.preventDefault();
    }
  },

  toggleListeners(enable) {
    const method = enable ? 'on' : 'off';
    const methods = { on, off };
    methods[method](document, 'keypress', this.onKeyPress);
  },

  onKeyPress(ev) {
    const { em } = this;
    const key = getKeyChar(ev);

    if (key === ' ' && em.getZoomDecimal() !== 1) {
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
    this.onFrameScroll();
    em.stopDefault(defOpts);
    em.trigger('canvas:update', ev);
    timerZoom && clearTimeout(timerZoom);
    timerZoom = setTimeout(() => em.runDefault(defOpts));
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
    const rect = getElRect(getElement(el));
    const frameRect = this.getFrameOffset();
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
   * Update tools position
   * @private
   */
  onFrameScroll() {
    var u = 'px';
    var body = this.frame.el.contentDocument.body;
    const zoom = this.getZoom();
    this.toolsEl.style.top = '-' + body.scrollTop * zoom + u;
    this.toolsEl.style.left = '-' + body.scrollLeft * zoom + u;
    this.em.trigger('canvasScroll');
  },

  /**
   * Insert scripts into head, it will call renderBody after all scripts loaded or failed
   * @private
   */
  renderScripts() {
    var frame = this.frame;
    var that = this;

    frame.el.onload = () => {
      var scripts = that.config.scripts.slice(0), // clone
        counter = 0;

      function appendScript(scripts) {
        if (scripts.length > 0) {
          var script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = scripts.shift();
          script.onerror = script.onload = appendScript.bind(null, scripts);
          frame.el.contentDocument.head.appendChild(script);
        } else {
          that.renderBody();
        }
      }
      appendScript(scripts);
    };
  },

  /**
   * Render inside frame's body
   * @private
   */
  renderBody() {
    const { config, model } = this;
    const wrap = this.model.get('frame').get('wrapper');
    const em = config.em;

    if (wrap) {
      const Canvas = em.get('Canvas');
      const ppfx = this.ppfx;
      const body = $(Canvas.getBody());
      const head = $(Canvas.getDocument().head);
      const cssc = em.get('CssComposer');
      const conf = em.get('Config');
      let externalStyles = '';

      config.styles.forEach(style => {
        externalStyles += `<link rel="stylesheet" href="${style}"/>`;
      });

      const colorWarn = '#ffca6f';

      // I need all this styles to make the editor work properly
      // Remove `html { height: 100%;}` from the baseCss as it gives jumpings
      // effects (on ENTER) with RTE like CKEditor (maybe some bug there?!?)
      // With `body {height: auto;}` jumps in CKEditor are removed but in
      // Firefox is impossible to drag stuff in empty canvas, so bring back
      // `body {height: 100%;}`.
      // For the moment I give the priority to Firefox as it might be
      // CKEditor's issue
      var frameCss = `
        ${em.config.baseCss || ''}

        .${ppfx}dashed *[data-highlightable] {
          outline: 1px dashed rgba(170,170,170,0.7);
          outline-offset: -2px;
        }

        .${ppfx}comp-selected {
          outline: 3px solid #3b97e3 !important;
          outline-offset: -3px;
        }

        .${ppfx}comp-selected-parent {
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

        ${conf.canvasCss || ''}
        ${conf.protectedCss || ''}
      `;

      if (externalStyles) {
        head.append(externalStyles);
      }

      body.append('<style>' + frameCss + '</style>');
      body.append(wrap.render()).append(cssc.render());
      body.append(this.getJsContainer());
      em.trigger('loaded');
      this.frame.el.contentWindow.onscroll = this.onFrameScroll;
      this.frame.udpateOffset();

      // Avoid the default link behaviour in the canvas
      body.on(
        'click',
        ev => ev && ev.target.tagName == 'A' && ev.preventDefault()
      );

      // When the iframe is focused the event dispatcher is not the same so
      // I need to delegate all events to the parent document
      const doc = document;
      const fdoc = this.frame.el.contentDocument;

      // Unfortunately just creating `KeyboardEvent(e.type, e)` is not enough,
      // the keyCode/which will be always `0`. Even if it's an old/deprecated
      // property keymaster (and many others) still use it... using `defineProperty`
      // hack seems the only way
      const createCustomEvent = (e, cls) => {
        let oEvent;
        try {
          oEvent = new window[cls](e.type, e);
        } catch (e) {
          oEvent = document.createEvent(cls);
          oEvent.initEvent(e.type, true, true);
        }
        oEvent.keyCodeVal = e.keyCode;
        oEvent._parentEvent = e;
        ['keyCode', 'which'].forEach(prop => {
          Object.defineProperty(oEvent, prop, {
            get() {
              return this.keyCodeVal;
            }
          });
        });
        return oEvent;
      };

      [
        { event: 'keydown keyup keypress', class: 'KeyboardEvent' },
        { event: 'wheel', class: 'WheelEvent' }
      ].forEach(obj =>
        obj.event.split(' ').forEach(event => {
          fdoc.addEventListener(event, e =>
            this.el.dispatchEvent(createCustomEvent(e, obj.class))
          );
        })
      );
    }
  },

  /**
   * Get the offset of the element
   * @param  {HTMLElement} el
   * @return {Object}
   */
  offset(el) {
    var rect = getElRect(el);
    var docBody = el.ownerDocument.body;
    return {
      top: rect.top + docBody.scrollTop,
      left: rect.left + docBody.scrollLeft,
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
  getFrameOffset(force = 0) {
    if (!this.frmOff || force) this.frmOff = this.offset(this.frame.el);
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
   * Returns element's data info
   * @param {HTMLElement} el
   * @return {Object}
   * @private
   */
  getElementPos(el, opts) {
    const zoom = this.getZoom();
    var opt = opts || {};
    var frmOff = this.getFrameOffset();
    var cvsOff = this.getCanvasOffset();
    var eo = this.offset(el);

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
  getPosition() {
    const doc = this.frame.el.contentDocument;
    if (!doc) return;
    const bEl = doc.body;
    const zoom = this.getZoom();
    const fo = this.getFrameOffset();
    const co = this.getCanvasOffset();

    return {
      top: fo.top + bEl.scrollTop * zoom - co.top,
      left: fo.left + bEl.scrollLeft * zoom - co.left
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
      view.scriptContainer = $(`<div id="${id}">`);
      this.getJsContainer().appendChild(view.scriptContainer.get(0));
    }

    view.el.id = id;
    view.scriptContainer.html('');
    // In editor, I make use of setTimeout as during the append process of elements
    // those will not be available immediately, therefore 'item' variable
    const script = document.createElement('script');
    script.innerHTML = `
        setTimeout(function() {
          var item = document.getElementById('${id}');
          if (!item) return;
          (function(){
            ${model.getScriptString()};
          }.bind(item))()
        }, 1);`;
    // #873
    // Adding setTimeout will make js components work on init of the editor
    setTimeout(() => view.scriptContainer.get(0).appendChild(script), 0);
  },

  /**
   * Get javascript container
   * @private
   */
  getJsContainer() {
    if (!this.jsContainer) {
      this.jsContainer = $(`<div class="${this.ppfx}js-cont">`).get(0);
    }
    return this.jsContainer;
  },

  render() {
    const { el, $el, ppfx, model } = this;
    this.wrapper = model.get('wrapper');
    $el.html(this.template());
    const $frames = $el.find('[data-frames]');
    this.framesArea = $frames.get(0);

    if (this.wrapper && typeof this.wrapper.render == 'function') {
      model.get('frame').set('wrapper', this.wrapper);
      $frames.append(this.frame.render().el);
      var frame = this.frame;
      if (this.config.scripts.length === 0) {
        frame.el.onload = this.renderBody;
      } else {
        this.renderScripts(); // will call renderBody later
      }
    }
    $el.find('[data-tools]').append(`
      <div id="${ppfx}tools" style="pointer-events:none">
        <div class="${ppfx}highlighter"></div>
        <div class="${ppfx}badge"></div>
        <div class="${ppfx}placeholder">
          <div class="${ppfx}placeholder-int"></div>
        </div>
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
    this.toolsEl = toolsEl;
    this.el.className = this.className;
    return this;
  }
});
