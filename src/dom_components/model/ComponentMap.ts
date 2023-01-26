import ComponentImage from './ComponentImage';
import { toLowerCase } from '../../utils/mixins';

export default class ComponentMap extends ComponentImage {
  /** @ts-ignore */
  get defaults() {
    // @ts-ignore
    const defs = super.defaults;

    return {
      ...defs,
      type: 'map',
      src: '',
      void: false,
      mapUrl: 'https://maps.google.com/maps',
      tagName: 'iframe',
      mapType: 'q',
      address: '',
      zoom: '1',
      attributes: { frameborder: 0 },
      // @ts-ignore
      toolbar: defs.toolbar,
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

  initialize(props: any, opts: any) {
    if (this.get('src')) this.parseFromSrc();
    else this.updateSrc();
    super.initialize(props, opts);
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
    let addr = this.get('address');
    let zoom = this.get('zoom');
    let type = this.get('mapType');
    addr = addr ? '&q=' + addr : '';
    zoom = zoom ? '&z=' + zoom : '';
    type = type ? '&t=' + type : '';
    let result = this.get('mapUrl') + '?' + addr + zoom + type;
    result += '&output=embed';
    return result;
  }

  /**
   * Set attributes by src string
   * @private
   */
  parseFromSrc() {
    const uri = this.parseUri(this.get('src'));
    const qr = uri.query;
    if (qr.q) this.set('address', qr.q);
    if (qr.z) this.set('zoom', qr.z);
    if (qr.t) this.set('mapType', qr.t);
  }

  static isComponent(el: HTMLIFrameElement) {
    if (toLowerCase(el.tagName) == 'iframe' && /maps\.google\.com/.test(el.src)) {
      return { type: 'map', src: el.src };
    }
  }
}
