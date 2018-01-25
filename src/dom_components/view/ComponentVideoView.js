let Backbone = require('backbone')
let ComponentView = require('./ComponentImageView')
let OComponentView = require('./ComponentView')

module.exports = ComponentView.extend({
  tagName: 'div',

  events: {},

  initialize(o) {
    OComponentView.prototype.initialize.apply(this, arguments)
    this.listenTo(this.model, 'change:src', this.updateSrc)
    this.listenTo(
      this.model,
      'change:loop change:autoplay change:controls change:color',
      this.updateVideo
    )
    this.listenTo(this.model, 'change:provider', this.updateProvider)
  },

  /**
   * Rerender on update of the provider
   * @private
   */
  updateProvider() {
    let prov = this.model.get('provider')
    this.el.innerHTML = ''
    this.el.appendChild(this.renderByProvider(prov))
  },

  /**
   * Update the source of the video
   * @private
   */
  updateSrc() {
    let prov = this.model.get('provider')
    let src = this.model.get('src')
    switch (prov) {
      case 'yt':
        src = this.model.getYoutubeSrc()
        break
      case 'vi':
        src = this.model.getVimeoSrc()
        break
    }
    this.videoEl.src = src
  },

  /**
   * Update video parameters
   * @private
   */
  updateVideo() {
    let prov = this.model.get('provider')
    let videoEl = this.videoEl
    let md = this.model
    switch (prov) {
      case 'yt':
      case 'vi':
        this.model.trigger('change:videoId')
        break
      default:
        videoEl.loop = md.get('loop')
        videoEl.autoplay = md.get('autoplay')
        videoEl.controls = md.get('controls')
    }
  },

  renderByProvider(prov) {
    let videoEl
    switch (prov) {
      case 'yt':
        videoEl = this.renderYoutube()
        break
      case 'vi':
        videoEl = this.renderVimeo()
        break
      default:
        videoEl = this.renderSource()
    }
    this.videoEl = videoEl
    return videoEl
  },

  renderSource() {
    let el = document.createElement('video')
    el.src = this.model.get('src')
    this.initVideoEl(el)
    return el
  },

  renderYoutube() {
    let el = document.createElement('iframe')
    el.src = this.model.getYoutubeSrc()
    el.frameBorder = 0
    el.setAttribute('allowfullscreen', true)
    this.initVideoEl(el)
    return el
  },

  renderVimeo() {
    let el = document.createElement('iframe')
    el.src = this.model.getVimeoSrc()
    el.frameBorder = 0
    el.setAttribute('allowfullscreen', true)
    this.initVideoEl(el)
    return el
  },

  initVideoEl(el) {
    el.className = this.ppfx + 'no-pointer'
    el.style.height = '100%'
    el.style.width = '100%'
  },

  render(...args) {
    ComponentView.prototype.render.apply(this, args)
    this.updateClasses()
    let prov = this.model.get('provider')
    this.el.appendChild(this.renderByProvider(prov))
    return this
  },
})
