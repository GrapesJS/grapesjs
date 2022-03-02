import { Model } from 'common';
import { hasWin } from 'utils/mixins';

const noLocalStorage = 'localStorage not available';

export default class LocalStorage extends Model {
  async store(data, resolve, reject, opts) {
    try {
      if (this.hasLocal(opts)) {
        localStorage.setItem(opts.key, JSON.stringify(data));
        resolve(data);
      } else {
        reject(noLocalStorage);
      }
    } catch (error) {
      reject(error);
    }

    return data;
  }

  async load(resolve, reject, opts) {
    let result = {};

    try {
      if (this.hasLocal(opts)) {
        result = JSON.parse(localStorage.getItem(opts.key) || '{}');
        resolve(result);
      } else {
        reject(noLocalStorage);
      }
    } catch (error) {
      reject(error);
    }

    return result;
  }

  /**
   * Check storage environment
   * @private
   * */
  hasLocal(opts = {}) {
    if (opts.checkLocal && (!hasWin() || !localStorage)) {
      return false;
    }

    return true;
  }
}
