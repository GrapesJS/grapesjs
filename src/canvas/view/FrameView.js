import Backbone from 'backbone';
import { bindAll } from 'underscore';
import { appendVNodes, empty } from 'utils/dom';

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

  getDoc() {
    return this.$el.get(0).contentDocument;
  },

  getHead() {
    return this.getDoc().querySelector('head');
  },

  getBody() {
    return this.getDoc().querySelector('body');
  },

  getWrapper() {
    return this.$el.contents().find('body > div');
  },

  render() {
    this.$el.attr({ class: this.ppfx + 'frame' });
    return this;
  }
});
