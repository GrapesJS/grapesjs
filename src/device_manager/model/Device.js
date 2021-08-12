import { Model } from 'backbone';

/**
 * @typedef Component
 * @property {String} [name=''] Device type, eg. `Mobile`
 * @property {String} [width] Width to set for the editor iframe, eg. '900px'
 * @property {String} [height=''] Height to set for the editor iframe, eg. '600px'
 * @property {String} [widthMedia=''] The width which will be used in media queries, If empty the width will be used
 * @property {Number} [priority=null] Setup the order of media queries
 */
export default class Device extends Model {
  defaults() {
    return {
      name: '',
      width: null,
      height: '',
      widthMedia: null,
      priority: null
    };
  }

  initialize() {
    this.get('widthMedia') === null &&
      this.set('widthMedia', this.get('width'));
    this.get('width') === null && this.set('width', this.get('widthMedia'));
    !this.get('priority') &&
      this.set('priority', parseFloat(this.get('widthMedia')) || 0);
    const toCheck = ['width', 'height', 'widthMedia'];
    toCheck.forEach(prop => this.checkUnit(prop));
  }

  /**
   * Get device width.
   * @returns {String}
   */
  getWidth() {
    return this.get('width');
  }

  checkUnit(prop) {
    const pr = this.get(prop) || '';
    const noUnit = (parseFloat(pr) || 0).toString() === pr.toString();
    noUnit && this.set(prop, `${pr}px`);
  }
}
