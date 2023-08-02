import { ObjectAny } from '../../common';
import { isDef, isEmptyObj, toLowerCase } from '../../utils/mixins';
import ComponentImage from './ComponentImage';

const type = 'video';
const yt = 'yt';
const vi = 'vi';
const ytnc = 'ytnc';
const defProvider = 'so';

const hasParam = (value: string) => value && value !== '0';

export default class ComponentVideo extends ComponentImage {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type,
      tagName: type,
      videoId: '',
      void: false,
      provider: defProvider, // on change of provider, traits are switched
      ytUrl: 'https://www.youtube.com/embed/',
      ytncUrl: 'https://www.youtube-nocookie.com/embed/',
      viUrl: 'https://player.vimeo.com/video/',
      loop: false,
      poster: '',
      muted: 0,
      autoplay: false,
      controls: true,
      color: '',
      list: '',
      rel: 1, // YT related videos
      modestbranding: 0, // YT modest branding
      sources: [],
      attributes: { allowfullscreen: 'allowfullscreen' },
    };
  }

  initialize(props: any, opts: any) {
    this.em = opts.em;
    if (this.get('src')) this.parseFromSrc();
    this.updatePropsFromAttr();
    this.updateTraits();
    this.on('change:provider', this.updateTraits);
    this.on('change:videoId change:provider', this.updateSrc);
    super.initialize(props, opts);
  }

  updatePropsFromAttr() {
    if (this.get('provider') === defProvider) {
      const { controls, autoplay, loop } = this.get('attributes')!;
      const toUp: ObjectAny = {};

      if (isDef(controls)) toUp.controls = !!controls;
      if (isDef(autoplay)) toUp.autoplay = !!autoplay;
      if (isDef(loop)) toUp.loop = !!loop;

      if (!isEmptyObj(toUp)) {
        this.set(toUp);
      }
    }
  }

  /**
   * Update traits by provider
   * @private
   */
  updateTraits() {
    const { em } = this;
    const prov = this.get('provider');
    let tagName = 'iframe';
    let traits;

    switch (prov) {
      case yt:
      case ytnc:
        traits = this.getYoutubeTraits();
        break;
      case vi:
        traits = this.getVimeoTraits();
        break;
      default:
        tagName = 'video';
        traits = this.getSourceTraits();
    }

    this.set({ tagName }, { silent: true }); // avoid break in view
    // @ts-ignore
    this.set({ traits });
    em.get('ready') && em.trigger('component:toggled');
  }

  /**
   * Set attributes by src string
   */
  parseFromSrc() {
    const prov = this.get('provider');
    const uri = this.parseUri(this.get('src'));
    const qr = uri.query;
    switch (prov) {
      case yt:
      case ytnc:
      case vi:
        this.set('videoId', uri.pathname.split('/').pop());
        qr.list && this.set('list', qr.list);
        hasParam(qr.autoplay) && this.set('autoplay', true);
        hasParam(qr.loop) && this.set('loop', true);
        parseInt(qr.controls) === 0 && this.set('controls', false);
        hasParam(qr.color) && this.set('color', qr.color);
        qr.rel === '0' && this.set('rel', 0);
        qr.modestbranding === '1' && this.set('modestbranding', 1);
        break;
      default:
    }
  }

  /**
   * Update src on change of video ID
   * @private
   */
  updateSrc() {
    const prov = this.get('provider');
    let src = '';

    switch (prov) {
      case yt:
        src = this.getYoutubeSrc();
        break;
      case ytnc:
        src = this.getYoutubeNoCookieSrc();
        break;
      case vi:
        src = this.getVimeoSrc();
        break;
    }

    this.set({ src });
  }

  /**
   * Returns object of attributes for HTML
   * @return {Object}
   * @private
   */
  getAttrToHTML() {
    const attr = super.getAttrToHTML();
    const prov = this.get('provider');

    switch (prov) {
      case yt:
      case ytnc:
      case vi:
        break;
      default:
        attr.loop = !!this.get('loop');
        attr.autoplay = !!this.get('autoplay');
        attr.controls = !!this.get('controls');
    }

    return attr;
  }

  // Listen provider change and switch traits, in TraitView listen traits change

  /**
   * Return the provider trait
   * @return {Object}
   * @private
   */
  getProviderTrait() {
    return {
      type: 'select',
      label: 'Provider',
      name: 'provider',
      changeProp: true,
      options: [
        { value: 'so', name: 'HTML5 Source' },
        { value: yt, name: 'Youtube' },
        { value: ytnc, name: 'Youtube (no cookie)' },
        { value: vi, name: 'Vimeo' },
      ],
    };
  }

  /**
   * Return traits for the source provider
   * @return {Array<Object>}
   * @private
   */
  getSourceTraits() {
    return [
      this.getProviderTrait(),
      {
        label: 'Source',
        name: 'src',
        placeholder: 'eg. ./media/video.mp4',
        changeProp: true,
      },
      {
        label: 'Poster',
        name: 'poster',
        placeholder: 'eg. ./media/image.jpg',
      },
      this.getAutoplayTrait(),
      this.getLoopTrait(),
      this.getControlsTrait(),
    ];
  }
  /**
   * Return traits for the source provider
   * @return {Array<Object>}
   * @private
   */
  getYoutubeTraits() {
    return [
      this.getProviderTrait(),
      {
        label: 'Video ID',
        name: 'videoId',
        placeholder: 'eg. jNQXAC9IVRw',
        changeProp: true,
      },
      this.getAutoplayTrait(),
      this.getLoopTrait(),
      this.getControlsTrait(),
      {
        type: 'checkbox',
        label: 'Related',
        name: 'rel',
        changeProp: true,
      },
      {
        type: 'checkbox',
        label: 'Modest',
        name: 'modestbranding',
        changeProp: true,
      },
    ];
  }

  /**
   * Return traits for the source provider
   * @return {Array<Object>}
   * @private
   */
  getVimeoTraits() {
    return [
      this.getProviderTrait(),
      {
        label: 'Video ID',
        name: 'videoId',
        placeholder: 'eg. 123456789',
        changeProp: true,
      },
      {
        label: 'Color',
        name: 'color',
        placeholder: 'eg. FF0000',
        changeProp: true,
      },
      this.getAutoplayTrait(),
      this.getLoopTrait(),
    ];
  }

  /**
   * Return object trait
   * @return {Object}
   * @private
   */
  getAutoplayTrait() {
    return {
      type: 'checkbox',
      label: 'Autoplay',
      name: 'autoplay',
      changeProp: true,
    };
  }

  /**
   * Return object trait
   * @return {Object}
   * @private
   */
  getLoopTrait() {
    return {
      type: 'checkbox',
      label: 'Loop',
      name: 'loop',
      changeProp: true,
    };
  }

  /**
   * Return object trait
   * @return {Object}
   * @private
   */
  getControlsTrait() {
    return {
      type: 'checkbox',
      label: 'Controls',
      name: 'controls',
      changeProp: true,
    };
  }

  /**
   * Returns url to youtube video
   * @return {string}
   * @private
   */
  getYoutubeSrc() {
    const id = this.get('videoId');
    let url = this.get('ytUrl') as string;
    const list = this.get('list');
    url += id + (id.indexOf('?') < 0 ? '?' : '');
    url += list ? `&list=${list}` : '';
    url += this.get('autoplay') ? '&autoplay=1&muted=1' : '';
    url += !this.get('controls') ? '&controls=0&showinfo=0' : '';
    // Loop works only with playlist enabled
    // https://stackoverflow.com/questions/25779966/youtube-iframe-loop-doesnt-work
    url += this.get('loop') ? `&loop=1&playlist=${id}` : '';
    url += this.get('rel') ? '' : '&rel=0';
    url += this.get('modestbranding') ? '&modestbranding=1' : '';
    return url;
  }

  /**
   * Returns url to youtube no cookie video
   * @return {string}
   * @private
   */
  getYoutubeNoCookieSrc() {
    let url = this.getYoutubeSrc();
    url = url.replace(this.get('ytUrl'), this.get('ytncUrl'));
    return url;
  }

  /**
   * Returns url to vimeo video
   * @return {string}
   * @private
   */
  getVimeoSrc() {
    let url = this.get('viUrl') as string;
    url += this.get('videoId') + '?';
    url += this.get('autoplay') ? '&autoplay=1&muted=1' : '';
    url += this.get('loop') ? '&loop=1' : '';
    url += !this.get('controls') ? '&title=0&portrait=0&badge=0' : '';
    url += this.get('color') ? '&color=' + this.get('color') : '';
    return url;
  }

  static isComponent(el: HTMLVideoElement) {
    const { tagName, src } = el;
    const isYtProv = /youtube\.com\/embed/.test(src);
    const isYtncProv = /youtube-nocookie\.com\/embed/.test(src);
    const isViProv = /player\.vimeo\.com\/video/.test(src);
    const isExtProv = isYtProv || isYtncProv || isViProv;
    if (toLowerCase(tagName) == type || (toLowerCase(tagName) == 'iframe' && isExtProv)) {
      const result: any = { type: 'video' };
      if (src) result.src = src;
      if (isExtProv) {
        if (isYtProv) result.provider = yt;
        else if (isYtncProv) result.provider = ytnc;
        else if (isViProv) result.provider = vi;
      }
      return result;
    }
  }
}
