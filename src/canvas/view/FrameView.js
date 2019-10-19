import Backbone from 'backbone';
import { bindAll, isNumber, isString, isNull, debounce } from 'underscore';
import CssRulesView from 'css_composer/view/CssRulesView';
import ComponentView from 'dom_components/view/ComponentView';
import {
  appendVNodes,
  empty,
  append,
  createEl,
  createCustomEvent
} from 'utils/dom';
import { on, off, setViewEl, getPointerEvent } from 'utils/mixins';

const motionsEv =
  'transitionend oTransitionEnd transitionend webkitTransitionEnd';

export default Backbone.View.extend({
  tagName: 'iframe',

  attributes: {
    allowfullscreen: 'allowfullscreen'
  },

  initialize(o) {
    bindAll(
      this,
      'updateOffset',
      'updateClientY',
      'stopAutoscroll',
      'autoscroll'
    );
    const { model, el } = this;
    this.config = {
      ...(o.config || {}),
      frameView: this
    };
    this.ppfx = this.config.pStylePrefix || '';
    this.em = this.config.em;
    this.listenTo(model, 'change:head', this.updateHead);
    this.listenTo(model, 'change:x change:y', this.updatePos);
    this.listenTo(model, 'change:width change:height', this.updateDim);
    this.updatePos();
    model.view = this;
    setViewEl(el, this);
  },

  updatePos(md) {
    const { model, el } = this;
    const { x, y } = model.attributes;
    const { style } = el;
    this.rect = 0;
    style.left = isNaN(x) ? x : `${x}px`;
    style.top = isNaN(y) ? y : `${y}px`;
    md && this.updateOffset();
  },

  /**
   * Update `<head>` content of the frame
   */
  updateHead() {
    const headEl = this.getHead();
    empty(headEl);
    appendVNodes(headEl, this.model.getHead());
  },

  /**
   * Update dimensions of the frame
   * @private
   */
  updateDim() {
    const { em, el, $el, model } = this;
    const { width, height } = model.attributes;
    const { style } = el;
    const currW = style.width || '';
    const currH = style.height || '';
    const newW = width;
    const newH = height;
    const noChanges = currW == newW && currH == newH;
    const un = 'px';
    this.rect = 0;
    style.width = isNumber(newW) ? `${newW}${un}` : newW;
    style.height = isNumber(newH) ? `${newH}${un}` : newH;

    // Set width and height from DOM (should be done only once)
    if (isNull(width) || isNull(height)) {
      const newDims = {
        ...(!width ? { width: el.offsetWidth } : {}),
        ...(!height ? { height: el.offsetHeight } : {})
      };
      model.set(newDims, { silent: 1 });
    }

    // Prevent fixed highlighting box which appears when on
    // component hover during the animation
    em.stopDefault({ preserveSelected: 1 });
    noChanges ? this.updateOffset() : $el.one(motionsEv, this.updateOffset);
  },

  updateOffset: debounce(function() {
    this.em.runDefault({ preserveSelected: 1 });
  }),

  getEl() {
    return this.el;
  },

  getWindow() {
    return this.getEl().contentWindow;
  },

  getDoc() {
    return this.getEl().contentDocument;
  },

  getHead() {
    return this.getDoc().querySelector('head');
  },

  getBody() {
    return this.getDoc().querySelector('body');
  },

  getWrapper() {
    return this.getBody().querySelector('[data-gjs-type=wrapper]');
  },

  getJsContainer() {
    if (!this.jsContainer) {
      this.jsContainer = createEl('div', { class: `${this.ppfx}js-cont` });
    }

    return this.jsContainer;
  },

  getToolsEl() {
    const { frameWrapView } = this.config;
    return frameWrapView && frameWrapView.elTools;
  },

  getGlobalToolsEl() {
    return this.em.get('Canvas').getGlobalToolsEl();
  },

  getHighlighter() {
    return this._getTool('[data-hl]');
  },

  getBadgeEl() {
    return this._getTool('[data-badge]');
  },

  getOffsetViewerEl() {
    return this._getTool('[data-offset]');
  },

  getRect() {
    if (!this.rect) {
      this.rect = this.el.getBoundingClientRect();
    }

    return this.rect;
  },

  _getTool(name) {
    const toolsEl = this.getToolsEl();

    if (!this[name]) {
      this[name] = toolsEl.querySelector(name);
    }

    return this[name];
  },

  remove() {
    Backbone.View.prototype.remove.apply(this, arguments);
  },

  startAutoscroll() {
    this.lastMaxHeight = this.getWrapper().offsetHeight - this.el.offsetHeight;

    // By detaching those from the stack avoid browsers lags
    // Noticeable with "fast" drag of blocks
    setTimeout(() => {
      this._toggleAutoscrollFx(1);
      requestAnimationFrame(this.autoscroll);
    }, 0);
  },

  autoscroll() {
    if (this.dragging) {
      const canvas = this.em.get('Canvas');
      const win = this.getWindow();
      const body = this.getBody();
      const actualTop = body.scrollTop;
      const clientY = this.lastClientY || 0;
      const limitTop = canvas.getConfig().autoscrollLimit;
      const limitBottom = this.getRect().height - limitTop;
      let nextTop = actualTop;

      if (clientY < limitTop) {
        nextTop -= limitTop - clientY;
      }

      if (clientY > limitBottom) {
        nextTop += clientY - limitBottom;
      }

      if (
        nextTop !== actualTop &&
        nextTop > 0 &&
        nextTop < this.lastMaxHeight
      ) {
        const toolsEl = this.getGlobalToolsEl();
        toolsEl.style.opacity = 0;
        this.showGlobalTools();
        win.scrollTo(0, nextTop);
      }

      requestAnimationFrame(this.autoscroll);
    }
  },

  updateClientY(ev) {
    ev.preventDefault();
    this.lastClientY = getPointerEvent(ev).clientY * this.em.getZoomDecimal();
  },

  showGlobalTools: debounce(function() {
    this.getGlobalToolsEl().style.opacity = '';
  }, 50),

  stopAutoscroll() {
    this.dragging && this._toggleAutoscrollFx();
  },

  _toggleAutoscrollFx(enable) {
    this.dragging = enable;
    const win = this.getWindow();
    const method = enable ? 'on' : 'off';
    const mt = { on, off };
    mt[method](win, 'mousemove dragover', this.updateClientY);
    mt[method](win, 'mouseup', this.stopAutoscroll);
  },

  render() {
    const { el, $el, ppfx, config } = this;
    $el.attr({ class: ppfx + 'frame' });

    if (config.scripts.length) {
      this.renderScripts();
    } else if (config.renderContent) {
      el.onload = this.renderBody.bind(this);
    }

    return this;
  },

  renderScripts() {
    const { el, config } = this;
    const appendScript = scripts => {
      if (scripts.length > 0) {
        const src = scripts.shift();
        const scriptEl = createEl('script', {
          type: 'text/javascript',
          ...(isString(src) ? { src } : src)
        });
        scriptEl.onerror = scriptEl.onload = appendScript.bind(null, scripts);
        el.contentDocument.head.appendChild(scriptEl);
      } else {
        this.renderBody();
      }
    };

    el.onload = () => appendScript([...config.scripts]);
  },

  renderBody() {
    const { config, model, ppfx } = this;
    const root = model.get('root');
    const styles = model.get('styles');
    const { em } = config;
    const doc = this.getDoc();
    const head = this.getHead();
    const body = this.getBody();
    const conf = em.get('Config');
    const extStyles = [];

    config.styles.forEach(href =>
      extStyles.push(
        isString(href)
          ? {
              tag: 'link',
              attributes: { href, rel: 'stylesheet' }
            }
          : {
              tag: 'link',
              attributes: {
                rel: 'stylesheet',
                ...href
              }
            }
      )
    );
    extStyles.length && appendVNodes(head, extStyles);

    const colorWarn = '#ffca6f';

    // I need all this styles to make the editor work properly
    // Remove `html { height: 100%;}` from the baseCss as it gives jumpings
    // effects (on ENTER) with RTE like CKEditor (maybe some bug there?!?)
    // With `body {height: auto;}` jumps in CKEditor are removed but in
    // Firefox is impossible to drag stuff in empty canvas, so bring back
    // `body {height: 100%;}`.
    // For the moment I give the priority to Firefox as it might be
    // CKEditor's issue
    append(
      body,
      `<style>
      * {
        box-sizing: border-box;
      }
      html, body, [data-gjs-type=wrapper] {
        min-height: 100%;
      }
      body {
        margin: 0;
        height: 100%;
        background-color: #fff
      }
      [data-gjs-type=wrapper] {
        overflow: auto;
        overflow-x: hidden;
      }

      * ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1)
      }

      * ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2)
      }

      * ::-webkit-scrollbar {
        width: 10px
      }

      .${ppfx}dashed *[data-highlightable] {
        outline: 1px dashed rgba(170,170,170,0.7);
        outline-offset: -2px;
      }

      .${ppfx}selected {
        outline: 3px solid #3b97e3 !important;
        outline-offset: -3px;
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
    </style>`
    );
    append(
      body,
      new ComponentView({
        model: root,
        config: {
          ...root.config,
          frameView: this
        }
      }).render().el
    );
    append(
      body,
      new CssRulesView({
        collection: styles,
        config: {
          ...em.get('CssComposer').getConfig(),
          frameView: this
        }
      }).render().el
    );
    append(body, this.getJsContainer());
    // em.trigger('loaded'); // I need to manage only the first one maybe
    //this.updateOffset(); // TOFIX (check if I need it)

    // Avoid some default behaviours
    on(
      body,
      'click',
      ev => ev && ev.target.tagName == 'A' && ev.preventDefault()
    );
    on(body, 'submit', ev => ev && ev.preventDefault());

    // When the iframe is focused the event dispatcher is not the same so
    // I need to delegate all events to the parent document
    [
      { event: 'keydown keyup keypress', class: 'KeyboardEvent' },
      { event: 'wheel', class: 'WheelEvent' }
    ].forEach(obj =>
      obj.event.split(' ').forEach(event => {
        doc.addEventListener(event, ev =>
          this.el.dispatchEvent(createCustomEvent(ev, obj.class))
        );
      })
    );

    this.updateDim();
    model.trigger('loaded');
  }
});
