import { bindAll } from 'underscore'

const motionsEv = 'transitionend oTransitionEnd transitionend webkitTransitionEnd';

module.exports = require('backbone').View.extend({

  tagName: 'iframe',

  attributes: {
    src: 'about:blank',
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
    style.width = device ? device.get('width') : '';
    style.height = device ? device.get('height') : '';
    this.udpateOffset();
    em.stopDefault({ preserveSelected: 1 });
    this.$el.on(motionsEv, this.udpateOffset);
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
    this.$el.attr({class: this.ppfx + 'frame'});
    return this;
  },

});
