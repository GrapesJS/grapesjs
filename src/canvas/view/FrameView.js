import Backbone from 'backbone';
import { bindAll } from 'underscore';
import CssRulesView from 'css_composer/view/CssRulesView';
import ComponentView from 'dom_components/view/ComponentView';
import {
  appendVNodes,
  empty,
  append,
  createEl,
  createCustomEvent
} from 'utils/dom';
import { on, off } from 'utils/mixins';

const motionsEv =
  'transitionend oTransitionEnd transitionend webkitTransitionEnd';

export default Backbone.View.extend({
  tagName: 'iframe',

  attributes: {
    allowfullscreen: 'allowfullscreen'
  },

  initialize(o) {
    bindAll(this, 'updateOffset');
    const { model } = this;
    this.config = o.config || {};
    this.ppfx = this.config.pStylePrefix || '';
    this.em = this.config.em;
    this.listenTo(model, 'change:head', this.updateHead);
    this.listenTo(model, 'change:x change:y', this.updatePos);
    this.listenTo(this.em, 'change:device', this.updateDim);
    this.updatePos();
    model.view = this;
  },

  updatePos(md) {
    const { model, el } = this;
    const { x, y } = model.attributes;
    const { style } = el;
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
    const { em, el, $el } = this;
    const { style } = el;
    const device = em.getDeviceModel();
    const currW = style.width || '';
    const currH = style.height || '';
    const newW = device ? device.get('width') : '';
    const newH = device ? device.get('height') : '';
    const noChanges = currW == newW && currH == newH;
    style.width = newW;
    style.height = newH;
    this.updateOffset();
    // Prevent fixed highlighting box which appears when on
    // component hover during the animation
    em.stopDefault({ preserveSelected: 1 });
    noChanges ? this.updateOffset() : $el.on(motionsEv, this.updateOffset);
  },

  updateOffset() {
    const { em } = this;
    const cv = em.get('Canvas');
    if (!cv) return;
    const offset = cv.getOffset();
    em.set('canvasOffset', offset);
    em.runDefault({ preserveSelected: 1 });
    this.$el.off(motionsEv, this.updateOffset);
  },

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

  remove() {
    Backbone.View.prototype.remove.apply(this, arguments);
  },

  render() {
    const { el, $el, ppfx, config } = this;
    $el.attr({ class: ppfx + 'frame' });
    if (config.renderContent) {
      el.onload = this.renderBody.bind(this);
    }
    return this;
  },

  renderBody() {
    const { config, model, ppfx } = this;
    const root = model.get('root');
    const styles = model.get('styles');
    const { em } = config;
    const win = this.getWindow();
    const doc = this.getDoc();
    const body = this.getBody();
    const conf = em.get('Config');

    // Should be handled by `head`
    // config.styles.forEach(style => {
    //   externalStyles += `<link rel="stylesheet" href="${style}"/>`;
    // });
    // externalStyles && head.append(externalStyles);

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
    append(body, new ComponentView({ model: root, config }).render().el);
    append(body, new CssRulesView({ collection: styles, config }).render().el);
    append(body, this.getJsContainer());
    // em.trigger('loaded'); // I need to manage only the first one maybe
    this.updateOffset(); // TOFIX (check if I need it)

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

    this.trigger('loaded');
  }
});
