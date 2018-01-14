import { bindAll } from 'underscore';

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
    this.listenTo(this.em, 'change:device', this.updateDim);
  },

  /**
   * Update dimensions of the frame
   * @private
   */
  updateDim(model) {
    const em = this.em;
    const device = em.getDeviceModel();
    const style = this.el.style;
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
    noChanges ? this.udpateOffset() : this.$el.on(motionsEv, this.udpateOffset);
  },

  udpateOffset() {
    const em = this.em;
    const offset = em.get('Canvas').getOffset();
    em.set('canvasOffset', offset);
    em.runDefault({ preserveSelected: 1 });
    this.$el.off(motionsEv, this.udpateOffset);
  },

  getBody() {
    this.$el.contents().find('body');
  },

  getWrapper() {
    return this.$el.contents().find('body > div');
  },

  render() {
    this.$el.attr({ class: this.ppfx + 'frame' });
    return this;
  }
});
