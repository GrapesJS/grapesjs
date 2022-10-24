import { Model } from '../../common';

/** @private */
export interface DeviceProperties {
  id?: string;
  /**
   * Device name.
   * @example 'Mobile'
   */
  name: string;
  /**
   * Width to set for the editor iframe.
   * @example '900px'
   */
  width: string | null;
  /**
   * Height to set for the editor iframe.
   * @example '600px'
   */
  height?: string;
  /**
   * The width which will be used in media queries, if empty the `width` will be used.
   * @example '900px'
   */
  widthMedia?: string | null;
  /**
   * Setup the order of media queries
   * @example 1
   */
  priority?: number | null;
}

/**
 * @typedef Device
 * @property {String} [name=''] Device type, eg. `Mobile`
 * @property {String} [width] Width to set for the editor iframe, eg. '900px'
 * @property {String} [height=''] Height to set for the editor iframe, eg. '600px'
 * @property {String} [widthMedia=''] The width which will be used in media queries, If empty the width will be used
 * @property {Number} [priority=null] Setup the order of media queries
 */
export default class Device extends Model<DeviceProperties> {
  defaults() {
    return {
      name: '',
      width: null,
      height: '',
      widthMedia: null,
      priority: null,
    };
  }

  initialize() {
    this.get('widthMedia') === null && this.set('widthMedia', this.get('width'));
    this.get('width') === null && this.set('width', this.get('widthMedia'));
    !this.get('priority') && this.set('priority', parseFloat(this.get('widthMedia')!) || 0);
    const toCheck: (keyof DeviceProperties)[] = ['width', 'height', 'widthMedia'];
    toCheck.forEach(prop => this.checkUnit(prop));
  }

  checkUnit(prop: keyof DeviceProperties) {
    const pr = (this.get(prop) || '') as string;
    const noUnit = (parseFloat(pr) || 0).toString() === pr.toString();
    noUnit && this.set(prop, `${pr}px`);
  }

  getName() {
    return this.get('name') || this.get('id');
  }

  getWidthMedia() {
    return this.get('widthMedia') || '';
  }
}
