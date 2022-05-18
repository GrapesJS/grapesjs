import ComponentView from './ComponentImageView';

export default class ComponentMapView extends ComponentView {
  tagName() {
    return 'div';
  }

  events() {
    return {};
  }

  initialize(o) {
    ComponentView.prototype.initialize.apply(this, arguments);
    this.classEmpty = this.ppfx + 'plh-map';
  }

  /**
   * Update the map on the canvas
   * @private
   */
  updateSrc() {
    this.getIframe().src = this.model.get('src');
  }

  getIframe() {
    if (!this.iframe) {
      var ifrm = document.createElement('iframe');
      ifrm.src = this.model.get('src');
      ifrm.frameBorder = 0;
      ifrm.style.height = '100%';
      ifrm.style.width = '100%';
      ifrm.className = this.ppfx + 'no-pointer';
      this.iframe = ifrm;
    }
    return this.iframe;
  }

  render(...args) {
    ComponentView.prototype.render.apply(this, args);
    this.updateClasses();
    this.el.appendChild(this.getIframe());
    return this;
  }
}
