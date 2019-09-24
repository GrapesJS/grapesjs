import Backbone from 'backbone';
import FrameView from './FrameView';
import { bindAll } from 'underscore';
import { createEl } from 'utils/dom';

export default Backbone.View.extend({
  initialize(opts = {}, conf = {}) {
    bindAll(this, 'onScroll', 'frameLoaded');
    const { model } = this;
    const config = {
      ...(opts.config || conf),
      frameWrapView: this
    };
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
      <div class="${ppfx}highlighter" data-hl></div>
      <div class="${ppfx}badge" data-badge></div>
      <div class="${ppfx}placeholder">
        <div class="${ppfx}placeholder-int"></div>
      </div>
      <div class="${ppfx}ghost"></div>
      <div class="${ppfx}toolbar" style="pointer-events:all"></div>
      <div class="${ppfx}resizer"></div>
      <div class="${ppfx}offset-v" data-offset>
        <div class="gjs-marginName" data-offset-m>
          <div class="gjs-margin-v-el gjs-margin-v-top" data-offset-m-t></div>
          <div class="gjs-margin-v-el gjs-margin-v-bottom" data-offset-m-b></div>
          <div class="gjs-margin-v-el gjs-margin-v-left" data-offset-m-l></div>
          <div class="gjs-margin-v-el gjs-margin-v-right" data-offset-m-r></div>
        </div>
        <div class="gjs-paddingName" data-offset-m>
          <div class="gjs-padding-v-el gjs-padding-v-top" data-offset-p-t></div>
          <div class="gjs-padding-v-el gjs-padding-v-bottom" data-offset-p-b></div>
          <div class="gjs-padding-v-el gjs-padding-v-left" data-offset-p-l></div>
          <div class="gjs-padding-v-el gjs-padding-v-right" data-offset-p-r></div>
        </div>
      </div>
      <div class="${ppfx}offset-fixed-v"></div>
    `
    );
    this.elTools = elTools;
    cv.toolsWrapper.appendChild(elTools); // TODO remove on frame remove
    frame.on('loaded', this.frameLoaded);

    return this;
  }
});
