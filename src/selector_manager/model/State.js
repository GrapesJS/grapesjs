import { Model } from 'common';

/**
 * @typedef State
 * @property {String} name State name, eg. `hover`, `nth-of-type(2n)`
 * @property {String} label State label, eg. `Hover`, `Even/Odd`
 */
export default class State extends Model {
  defaults() {
    return {
      name: '',
      label: ''
    };
  }

  /**
   * Get state name
   * @returns {String}
   */
  getName() {
    return this.get('name');
  }

  /**
   * Get state label
   * @returns {String}
   */
  getLabel() {
    return this.get('label') || this.getName();
  }
}

State.prototype.idAttribute = 'name';
