var Component = require('./ComponentImage');
var OComponent = require('./Component');

var yt = 'yt';
var vi = 'vi';

module.exports = Component.extend({

  defaults: _.extend({}, Component.prototype.defaults, {
      type: 'video',
      tagName: 'video',
      videoId: '',
      void: 0,
      provider: '', // on change of provider, traits are switched
      ytUrl: 'https://www.youtube.com/embed/',
      viUrl: 'https://player.vimeo.com/video/',
      loop: 0,
      muted: 0,
      autoplay: 0,
      controls: 1,
      color: '',
      sources: [],
      attributes:{allowfullscreen:'allowfullscreen'},
      toolbar: OComponent.prototype.defaults.toolbar,
  }),

  initialize(o, opt) {
    var traits = [];
    var prov = this.get('provider');
    switch (prov) {
      case yt:
        traits = this.getYoutubeTraits();
        break;
      case vi:
        traits = this.getVimeoTraits();
        break;
      default:
        traits = this.getSourceTraits();
    }
    if(this.get('src'))
      this.parseFromSrc();
    this.set('traits', traits);
    Component.prototype.initialize.apply(this, arguments);
    this.listenTo(this, 'change:provider', this.updateTraits);
    this.listenTo(this, 'change:videoId', this.updateSrc);
  },

  /**
   * Set attributes by src string
   */
  parseFromSrc() {
    var prov = this.get('provider');
    var uri = this.parseUri(this.get('src'));
    var qr = uri.query;
    switch (prov) {
      case yt: case vi:
        var videoId = uri.pathname.split('/').pop();
        this.set('videoId', videoId);
        if(qr.autoplay)
          this.set('autoplay', 1);
        if(qr.loop)
          this.set('loop', 1);
        if(parseInt(qr.controls) === 0)
          this.set('controls', 0);
        if(qr.color)
          this.set('color', qr.color);
        break;
      default:
    }
  },

  /**
   * Update src on change of video ID
   * @private
   */
  updateSrc() {
    var prov = this.get('provider');
    switch (prov) {
      case yt:
        this.set('src',this.getYoutubeSrc());
        break;
      case vi:
        this.set('src',this.getVimeoSrc());
        break;
    }
  },

  /**
   * Returns object of attributes for HTML
   * @return {Object}
   * @private
   */
  getAttrToHTML(...args) {
    var attr = Component.prototype.getAttrToHTML.apply(this, args);
    var prov = this.get('provider');
    switch (prov) {
      case yt: case vi:
        break;
      default:
        if(this.get('loop'))
          attr.loop = 'loop';
        if(this.get('autoplay'))
          attr.autoplay = 'autoplay';
        if(this.get('controls'))
          attr.controls = 'controls';
    }
    return attr;
  },

  /**
   * Update traits by provider
   * @private
   */
  updateTraits() {
    var prov = this.get('provider');
    var traits = this.getSourceTraits();
    switch (prov) {
      case yt:
        this.set('tagName', 'iframe');
        traits = this.getYoutubeTraits();
        break;
      case vi:
        this.set('tagName', 'iframe');
        traits = this.getVimeoTraits();
        break;
      default:
        this.set('tagName', 'video');
    }
    this.loadTraits(traits);
    this.sm.trigger('change:selectedComponent');
  },

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
      changeProp: 1,
      value: this.get('provider'),
      options: [
        {value: 'so', name: 'HTML5 Source'},
        {value: yt, name: 'Youtube'},
        {value: vi, name: 'Vimeo'}
      ]
    };
  },

  /**
   * Return traits for the source provider
   * @return {Array<Object>}
   * @private
   */
  getSourceTraits() {
    return [
      this.getProviderTrait(), {
        label: 'Source',
        name: 'src',
        placeholder: 'eg. ./media/video.mp4',
        changeProp: 1,
      },
      this.getAutoplayTrait(),
      this.getLoopTrait(),
      this.getControlsTrait()];
  },
  /**
   * Return traits for the source provider
   * @return {Array<Object>}
   * @private
   */
  getYoutubeTraits() {
    return [
      this.getProviderTrait(), {
        label: 'Video ID',
        name: 'videoId',
        placeholder: 'eg. jNQXAC9IVRw',
        changeProp: 1,
      },
      this.getAutoplayTrait(),
      this.getLoopTrait(),
      this.getControlsTrait()
    ];
  },

  /**
   * Return traits for the source provider
   * @return {Array<Object>}
   * @private
   */
  getVimeoTraits() {
    return [
      this.getProviderTrait(), {
        label: 'Video ID',
        name: 'videoId',
        placeholder: 'eg. 123456789',
        changeProp: 1,
      },{
        label: 'Color',
        name: 'color',
        placeholder: 'eg. FF0000',
        changeProp: 1,
      },
      this.getAutoplayTrait(),
      this.getLoopTrait(),
      this.getControlsTrait()];
  },

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
      changeProp: 1,
    };
  },

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
      changeProp: 1,
    };
  },

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
      changeProp: 1,
    };
  },


  /**
   * Returns url to youtube video
   * @return {string}
   * @private
   */
  getYoutubeSrc() {
    var url = this.get('ytUrl');
    url += this.get('videoId') + '?';
    url += this.get('autoplay') ? '&autoplay=1' : '';
    url += !this.get('controls') ? '&controls=0' : '';
    url += this.get('loop') ? '&loop=1' : '';
    return url;
  },

  /**
   * Returns url to vimeo video
   * @return {string}
   * @private
   */
  getVimeoSrc() {
    var url = this.get('viUrl');
    url += this.get('videoId') + '?';
    url += this.get('autoplay') ? '&autoplay=1' : '';
    url += this.get('loop') ? '&loop=1' : '';
    url += !this.get('controls') ? '&title=0&portrait=0&badge=0' : '';
    url += this.get('color') ? '&color=' + this.get('color') : '';
    return url;
  },

},{

  /**
   * Detect if the passed element is a valid component.
   * In case the element is valid an object abstracted
   * from the element will be returned
   * @param {HTMLElement}
   * @return {Object}
   * @private
   */
  isComponent(el) {
    var result = '';
    var isYtProv = /youtube\.com\/embed/.test(el.src);
    var isViProv = /player\.vimeo\.com\/video/.test(el.src);
    var isExtProv = isYtProv || isViProv;
    if(el.tagName == 'VIDEO' ||
      (el.tagName == 'IFRAME' && isExtProv) ){
      result = {type: 'video'};
      if(el.src)
        result.src = el.src;
      if(isExtProv){
        if(isYtProv)
          result.provider = yt;
        else if(isViProv)
          result.provider = vi;
      }
    }
    return result;
  },

});
