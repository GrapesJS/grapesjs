import ComponentImage from './ComponentImage';
import { toLowerCase } from 'utils/mixins';

export default class ComponentMap extends ComponentImage {
  get defaults() {
    return {
      ...super.defaults,
      type: 'map',
      src: '',
      void: 0,
      mapUrl: 'https://maps.google.com/maps',
      tagName: 'iframe',
      mapType: 'q',
      address: '',
      zoom: '1',
      attributes: { frameborder: 0 },
      toolbar: super.defaults.toolbar,
      traits: [
        {
          label: 'Address',
          name: 'address',
          placeholder: 'eg. London, UK',
          changeProp: 1,
        },
        {
          type: 'select',
          label: 'Map type',
          name: 'mapType',
          changeProp: 1,
          options: [
            { value: 'q', name: 'Roadmap' },
            { value: 'w', name: 'Satellite' },
          ],
        },
        {
          label: 'Zoom',
          name: 'zoom',
          type: 'range',
          min: '1',
          max: '20',
          changeProp: 1,
        },
      ],
    };
  }

  initialize(o, opt) {
    if (this.get('src')) this.parseFromSrc();
    else this.updateSrc();
    ComponentImage.prototype.initialize.apply(this, arguments);
    this.listenTo(this, 'change:address change:zoom change:mapType', this.updateSrc);
  }

  updateSrc() {
    this.set('src', this.getMapUrl());
  }

  /**
   * Returns url of the map
   * @return {string}
   * @private
   */
  getMapUrl() {
    var md = this;
    var addr = md.get('address');
    var zoom = md.get('zoom');
    var type = md.get('mapType');
    var size = '';
    addr = addr ? '&q=' + addr : '';
    zoom = zoom ? '&z=' + zoom : '';
    type = type ? '&t=' + type : '';
    var result = md.get('mapUrl') + '?' + addr + zoom + type;
    result += '&output=embed';
    return result;
  }

  /**
   * Set attributes by src string
   * @private
   */
  parseFromSrc() {
    var uri = this.parseUri(this.get('src'));
    var qr = uri.query;
    if (qr.q) this.set('address', qr.q);
    if (qr.z) this.set('zoom', qr.z);
    if (qr.t) this.set('mapType', qr.t);
  }
}

/**
 * Detect if the passed element is a valid component.
 * In case the element is valid an object abstracted
 * from the element will be returned
 * @param {HTMLElement}
 * @return {Object}
 * @private
 */
ComponentMap.isComponent = el => {
  var result = '';
  if (toLowerCase(el.tagName) == 'iframe' && /maps\.google\.com/.test(el.src)) {
    result = { type: 'map', src: el.src };
  }
  return result;
};
