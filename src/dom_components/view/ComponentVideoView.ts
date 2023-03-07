import ComponentVideo from '../model/ComponentVideo';
import ComponentImageView from './ComponentImageView';
import ComponentView from './ComponentView';

export default class ComponentVideoView extends ComponentImageView {
  videoEl?: HTMLVideoElement | HTMLIFrameElement;
  model!: ComponentVideo;

  tagName() {
    return 'div';
  }

  // @ts-ignore
  events() {
    return {};
  }

  initialize() {
    // @ts-ignore
    ComponentView.prototype.initialize.apply(this, arguments);
    const { model } = this;
    const props = ['loop', 'autoplay', 'controls', 'color', 'rel', 'modestbranding', 'poster'];
    const events = props.map(p => `change:${p}`).join(' ');
    this.listenTo(model, 'change:provider', this.updateProvider);
    this.listenTo(model, 'change:src', this.updateSrc);
    this.listenTo(model, events, this.updateVideo);
  }

  /**
   * Rerender on update of the provider
   * @private
   */
  updateProvider() {
    var prov = this.model.get('provider');
    this.el.innerHTML = '';
    this.el.appendChild(this.renderByProvider(prov));
  }

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
  }

  /**
   * Update video parameters
   * @private
   */
  updateVideo() {
    const { model, videoEl } = this;
    const prov = model.get('provider');
    switch (prov) {
      case 'yt':
      case 'ytnc':
      case 'vi':
        model.trigger('change:videoId');
        break;
      default: {
        if (videoEl) {
          const el = videoEl as HTMLVideoElement;
          el.loop = model.get('loop');
          el.autoplay = model.get('autoplay');
          el.controls = model.get('controls');
          el.poster = model.get('poster');
        }
      }
    }
  }

  renderByProvider(prov: string) {
    let videoEl;

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
  }

  renderSource() {
    const el = document.createElement('video');
    el.src = this.model.get('src');
    this.initVideoEl(el);
    return el;
  }

  renderYoutube() {
    const el = document.createElement('iframe');
    el.src = this.model.getYoutubeSrc();
    el.frameBorder = '0';
    el.setAttribute('allowfullscreen', 'true');
    this.initVideoEl(el);
    return el;
  }

  renderYoutubeNoCookie() {
    var el = document.createElement('iframe');
    el.src = this.model.getYoutubeNoCookieSrc();
    el.frameBorder = '0';
    el.setAttribute('allowfullscreen', 'true');
    this.initVideoEl(el);
    return el;
  }

  renderVimeo() {
    var el = document.createElement('iframe');
    el.src = this.model.getVimeoSrc();
    el.frameBorder = '0';
    el.setAttribute('allowfullscreen', 'true');
    this.initVideoEl(el);
    return el;
  }

  initVideoEl(el: HTMLElement) {
    el.className = this.ppfx + 'no-pointer';
    el.style.height = '100%';
    el.style.width = '100%';
  }

  render() {
    ComponentView.prototype.render.apply(this);
    this.updateClasses();
    var prov = this.model.get('provider');
    this.el.appendChild(this.renderByProvider(prov));
    this.updateVideo();
    return this;
  }
}
