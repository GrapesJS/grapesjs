import { bindAll } from 'underscore';
import { appendVNodes, empty } from 'utils/dom';

const motionsEv =
  'transitionend oTransitionEnd transitionend webkitTransitionEnd';

module.exports = require('backbone').View.extend({
  tagName: 'iframe',

  attributes: {
    allowfullscreen: 'allowfullscreen'
  },

  initialize(o) {
    bindAll(this, 'udpateOffset');
    this.config = o.config || {};
    this.ppfx = this.config.pStylePrefix || '';
    this.em = this.config.em;
    this.listenTo(this.model, 'change:head', this.updateHead);
    this.listenTo(this.em, 'change:device', this.updateDim);
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
    this.udpateOffset();
    // Prevent fixed highlighting box which appears when on
    // component hover during the animation
    em.stopDefault({ preserveSelected: 1 });
    noChanges ? this.udpateOffset() : $el.on(motionsEv, this.udpateOffset);
  },

  udpateOffset() {
    const em = this.em;
    const offset = em.get('Canvas').getOffset();
    em.set('canvasOffset', offset);
    em.runDefault({ preserveSelected: 1 });
    this.$el.off(motionsEv, this.udpateOffset);
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
