import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    checkLocal: true
  },

  /**
   * @private
   */
  store(data, clb) {
    this.checkStorageEnvironment();

    for (var key in data) localStorage.setItem(key, data[key]);

    if (typeof clb == 'function') {
      clb();
    }
  },

  /**
   * @private
   */
  load(keys, clb) {
    this.checkStorageEnvironment();
    var result = {};

    for (var i = 0, len = keys.length; i < len; i++) {
      var value = localStorage.getItem(keys[i]);
      if (value) result[keys[i]] = value;
    }

    if (typeof clb == 'function') {
      clb(result);
    }

    return result;
  },

  /**
   * @private
   */
  remove(keys) {
    this.checkStorageEnvironment();

    for (var i = 0, len = keys.length; i < len; i++)
      localStorage.removeItem(keys[i]);
  },

  /**
   * Check storage environment
   * @private
   * */
  checkStorageEnvironment() {
    if (this.get('checkLocal') && !localStorage)
      console.warn("Your browser doesn't support localStorage");
  }
});
