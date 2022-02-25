import { Model } from 'backbone';
import { hasWin } from 'utils/mixins';

const noLocalStorage = 'localStorage not available';

export default Model.extend({
  defaults: {
    checkLocal: true,
  },

  /**
   * @private
   */
  async store(data, resolve, reject, opts) {
    try {
      if (this.hasLocal()) {
        localStorage.setItem(opts.key, JSON.stringify(data));
        return resolve();
      } else {
        reject(noLocalStorage);
      }
    } catch (error) {
      reject(error);
    }
  },

  /**
   * @private
   */
  async load(resolve, reject, opts) {
    let result = {};

    try {
      if (this.hasLocal()) {
        result = JSON.parse(localStorage.getItem(opts.key) || '{}');
        resolve(result);
      } else {
        reject(noLocalStorage);
      }
    } catch (error) {
      reject(error);
    }

    return result;
  },

  /**
   * @private
   */
  remove(keys) {
    if (!this.hasLocal()) return;

    for (let i = 0, len = keys.length; i < len; i++) localStorage.removeItem(keys[i]);
  },

  /**
   * Check storage environment
   * @private
   * */
  hasLocal() {
    if (this.get('checkLocal') && (!hasWin() || !localStorage)) {
      return false;
    }

    return true;
  },
});
