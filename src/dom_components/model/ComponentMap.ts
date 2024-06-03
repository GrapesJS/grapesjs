import ComponentImage from './ComponentImage';
import { toLowerCase } from '../../utils/mixins';
import { ComponentOptions, ComponentProperties } from './types';

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
          changeProp: true,
        },
        {
          type: 'select',
          label: 'Map type',
          name: 'mapType',
          changeProp: true,
          options: [
            { id: 'q', label: 'Roadmap' },
            { id: 'w', label: 'Satellite' },
          ],
        },
        {
          label: 'Zoom',
          name: 'zoom',
          type: 'range',
          min: 1,
          max: 20,
          changeProp: true,
        },
      ],
    };
  }

  constructor(props: ComponentProperties = {}, opt: ComponentOptions) {
    super(props, opt);
    if (this.get('src')) this.parseFromSrc();
    else this.updateSrc();

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
