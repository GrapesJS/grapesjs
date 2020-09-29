import ComponentView from './ComponentImageView';
import OComponentView from './ComponentView';

export default ComponentView.extend({
  tagName: 'div',

  events: {},

  initialize(o) {
    OComponentView.prototype.initialize.apply(this, arguments);
    const { model } = this;
    const props = [
      'loop',
      'autoplay',
      'controls',
      'color',
      'rel',
      'modestbranding',
      'poster'
    ];
    const events = props.map(p => `change:${p}`).join(' ');
    this.listenTo(model, 'change:provider', this.updateProvider);
    this.listenTo(model, 'change:src', this.updateSrc);
    this.listenTo(model, events, this.updateVideo);
  },

  /**
   * Rerender on update of the provider
   * @private
   */
  updateProvider() {
    var prov = this.model.get('provider');
    this.el.innerHTML = '';
    this.el.appendChild(this.renderByProvider(prov));
  },

  /**
   * Update the source of the video
   * @private
   */
  updateSrc() {
    const { model, videoEl } = this;
    if (!videoEl) return;
    const prov = model.get('provider');
    let src = model.get('src');

    switch (prov) {
      case 'yt':
        src = model.getYoutubeSrc();
        break;
      case 'ytnc':
        src = model.getYoutubeNoCookieSrc();
        break;
      case 'vi':
        src = model.getVimeoSrc();
        break;
    }

    videoEl.src = src;
  },

  /**
   * Update video parameters
   * @private
   */
  updateVideo() {
    var prov = this.model.get('provider');
    var videoEl = this.videoEl;
    var md = this.model;
    switch (prov) {
      case 'yt':
      case 'ytnc':
      case 'vi':
        this.model.trigger('change:videoId');
        break;
      default:
        videoEl.loop = md.get('loop');
        videoEl.autoplay = md.get('autoplay');
        videoEl.controls = md.get('controls');
        videoEl.poster = md.get('poster');
    }
  },

  renderByProvider(prov) {
    var videoEl;
    switch (prov) {
      case 'yt':
        videoEl = this.renderYoutube();
        break;
      case 'ytnc':
        videoEl = this.renderYoutubeNoCookie();
        break;
      case 'vi':
        videoEl = this.renderVimeo();
        break;
      default:
        videoEl = this.renderSource();
    }
    this.videoEl = videoEl;
    return videoEl;
  },

  renderSource() {
    var el = document.createElement('video');
    el.src = this.model.get('src');
    this.initVideoEl(el);
    return el;
  },

  renderYoutube() {
    var el = document.createElement('iframe');
    el.src = this.model.getYoutubeSrc();
    el.frameBorder = 0;
    el.setAttribute('allowfullscreen', true);
    this.initVideoEl(el);
    return el;
  },

  renderYoutubeNoCookie() {
    var el = document.createElement('iframe');
    el.src = this.model.getYoutubeNoCookieSrc();
    el.frameBorder = 0;
    el.setAttribute('allowfullscreen', true);
    this.initVideoEl(el);
    return el;
  },

  renderVimeo() {
    var el = document.createElement('iframe');
    el.src = this.model.getVimeoSrc();
    el.frameBorder = 0;
    el.setAttribute('allowfullscreen', true);
    this.initVideoEl(el);
    return el;
  },

  initVideoEl(el) {
    el.className = this.ppfx + 'no-pointer';
    el.style.height = '100%';
    el.style.width = '100%';
  },

  render(...args) {
    ComponentView.prototype.render.apply(this, args);
    this.updateClasses();
    var prov = this.model.get('provider');
    this.el.appendChild(this.renderByProvider(prov));
    this.updateVideo();
    return this;
  }
});
