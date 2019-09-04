import Backbone from 'backbone';
import FrameView from './FrameView';
import { bindAll } from 'underscore';
import { createEl } from 'utils/dom';

export default Backbone.View.extend({
  initialize(opts = {}, conf = {}) {
    bindAll(this, 'onScroll', 'frameLoaded');
    const { model } = this;
    const config = opts.config || conf;
    const { canvasView } = config;
    this.cv = canvasView;
    this.config = config;
    this.em = config.em;
    this.ppfx = config.pStylePrefix || '';
    this.frame = new FrameView({ model, config });
    // this.listenTo(canvasView.model, 'change:zoom', this.canvasChange)
  },

  // canvasChange() {
  //   const zoom = this.config.module.getZoomMultiplier();
  //   this.elTools.style.transform = `scale(${zoom})`;
  // },

  onScroll() {
    const { frame, em } = this;
    // const unit = 'px';
    // const { scrollTop, scrollLeft } = frame.getBody();
    // const { style } = this.elTools;
    // style.top = `-${scrollTop}${unit}`;
    // style.left = `-${scrollLeft}${unit}`;
    em.trigger('frame:scroll', {
      frame,
      body: frame.getBody(),
      target: frame.getWindow()
    });
  },

  frameLoaded() {
    const { frame } = this;
    frame.getWindow().onscroll = this.onScroll;
  },

  render() {
    const { frame, $el, ppfx, cv } = this;
    frame.render();
    $el
      .empty()
      .attr({
        class: `${ppfx}frame-wrapper`
      })
      .append(frame.el);
    const elTools = createEl(
      'div',
      {
        class: `${ppfx}tools`,
        style: 'pointer-events:none'
      },
      `
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
    `
    );
    this.elTools = elTools;
    cv.toolsWrapper.appendChild(elTools);
    frame.on('loaded', this.frameLoaded);

    return this;
  }
});
