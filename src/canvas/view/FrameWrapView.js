import Backbone from 'backbone';
import FrameView from './FrameView';
import { bindAll, isNumber, isNull, debounce } from 'underscore';
import { createEl, removeEl } from 'utils/dom';
import Dragger from 'utils/Dragger';

export default Backbone.View.extend({
  events: {
    'click [data-action-remove]': 'remove',
    'mousedown [data-action-move]': 'startDrag'
  },

  initialize(opts = {}, conf = {}) {
    bindAll(
      this,
      'onScroll',
      'frameLoaded',
      'updateOffset',
      'remove',
      'startDrag'
    );
    const { model } = this;
    const config = {
      ...(opts.config || conf),
      frameWrapView: this
    };
    const { canvasView, em } = config;
    this.cv = canvasView;
    this.config = config;
    this.em = em;
    this.canvas = em && em.get('Canvas');
    this.ppfx = config.pStylePrefix || '';
    this.frame = new FrameView({ model, config });
    this.classAnim = `${this.ppfx}frame-wrapper--anim`;
    this.updateOffset = debounce(this.updateOffset.bind(this));
    this.updateSize = debounce(this.updateSize.bind(this));
    this.listenTo(model, 'loaded', this.frameLoaded);
    this.listenTo(model, 'change:x change:y', this.updatePos);
    this.listenTo(model, 'change:width change:height', this.updateSize);
    this.listenTo(model, 'destroy remove', this.remove);
    this.updatePos();
    this.setupDragger();
  },

  setupDragger() {
    const { canvas, model } = this;
    let dragX, dragY, zoom;
    const toggleEffects = on => {
      canvas.toggleFramesEvents(on);
    };

    this.dragger = new Dragger({
      onStart: () => {
        const { x, y } = model.attributes;
        zoom = this.em.getZoomMultiplier();
        dragX = x;
        dragY = y;
        toggleEffects();
      },
      onEnd: () => toggleEffects(1),
      setPosition: posOpts => {
        model.set({
          x: dragX + posOpts.x * zoom,
          y: dragY + posOpts.y * zoom
        });
      }
    });
  },

  startDrag(ev) {
    ev && this.dragger.start(ev);
  },

  remove(opts) {
    this.frame.remove(opts);
    removeEl(this.elTools);
    Backbone.View.prototype.remove.apply(this, arguments);
    ['frame', 'dragger', 'cv', 'em', 'canvas', 'elTools'].forEach(
      i => (this[i] = 0)
    );
    return this;
  },

  updateOffset() {
    const { em, $el, frame } = this;
    if (!em) return;
    em.runDefault({ preserveSelected: 1 });
    $el.removeClass(this.classAnim);
    frame.model._emitUpdated();
  },

  updatePos(md) {
    const { model, el } = this;
    const { x, y } = model.attributes;
    const { style } = el;
    this.frame.rect = 0;
    style.left = isNaN(x) ? x : `${x}px`;
    style.top = isNaN(y) ? y : `${y}px`;
    md && this.updateOffset();
  },

  updateSize() {
    this.updateDim();
  },

  /**
   * Update dimensions of the frame
   * @private
   */
  updateDim() {
    const { em, el, $el, model, classAnim } = this;
    this.frame.rect = 0;
    $el.addClass(classAnim);
    const { noChanges, width, height } = this.__handleSize();

    // Set width and height from DOM (should be done only once)
    if (isNull(width) || isNull(height)) {
      model.set(
        {
          ...(!width ? { width: el.offsetWidth } : {}),
          ...(!height ? { height: el.offsetHeight } : {})
        },
        { silent: 1 }
      );
    }

    // Prevent fixed highlighting box which appears when on
    // component hover during the animation
    em.stopDefault({ preserveSelected: 1 });
    noChanges ? this.updateOffset() : setTimeout(this.updateOffset, 350);
  },

  onScroll() {
    const { frame, em } = this;
    em.trigger('frame:scroll', {
      frame,
      body: frame.getBody(),
      target: frame.getWindow()
    });
  },

  frameLoaded() {
    const { frame } = this;
    frame.getWindow().onscroll = this.onScroll;
    this.updateDim();
  },

  __handleSize() {
    const un = 'px';
    const { model, el } = this;
    const { style } = el;
    const { width, height } = model.attributes;
    const currW = style.width || '';
    const currH = style.height || '';
    const newW = width || '';
    const newH = height || '';
    const noChanges = currW == newW && currH == newH;
    style.width = isNumber(newW) ? `${newW}${un}` : newW;
    style.height = isNumber(newH) ? `${newH}${un}` : newH;
    return { noChanges, width, height, newW, newH };
  },

  render() {
    const { frame, $el, ppfx, cv, model, el } = this;
    const { onRender } = model.attributes;
    frame && frame.remove();
    this.__handleSize();
    frame.render();
    $el
      .empty()
      .attr({ class: `${ppfx}frame-wrapper` })
      .append(
        `
      <div class="${ppfx}frame-wrapper__top gjs-two-color" data-frame-top>
        <div class="${ppfx}frame-wrapper__name" data-action-move>
          ${model.get('name') || ''}
        </div>
        <div class="${ppfx}frame-wrapper__top-r">
          <div class="${ppfx}frame-wrapper__icon" data-action-remove style="display: none">
            <svg viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"></path></svg>
          </div>
        </div>
      </div>
      <div class="${ppfx}frame-wrapper__right" data-frame-right></div>
      <div class="${ppfx}frame-wrapper__left" data-frame-left></div>
      <div class="${ppfx}frame-wrapper__bottom" data-frame-bottom></div>
      `
      )
      .append(frame.el);
    const elTools = createEl(
      'div',
      {
        class: `${ppfx}tools`,
        style: 'pointer-events:none; display: none'
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
    const twrp = cv.toolsWrapper;
    twrp && twrp.appendChild(elTools); // TODO remove on frame remove
    onRender &&
      onRender({
        el,
        elTop: el.querySelector('[data-frame-top]'),
        elRight: el.querySelector('[data-frame-right]'),
        elBottom: el.querySelector('[data-frame-bottom]'),
        elLeft: el.querySelector('[data-frame-left]'),
        frame: model,
        frameWrapperView: this,
        remove: this.remove,
        startDrag: this.startDrag
      });
    return this;
  }
});
