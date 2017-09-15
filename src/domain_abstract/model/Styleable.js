export default {

  /**
   * To trigger the style change event on models I have to
   * pass a new object instance
   * @param {Object} prop
   * @return {Object}
   */
  extendStyle(prop) {
    return Object.assign({}, this.getStyle(), prop);
  },

  /**
   * Get style object
   * @return {Object}
   */
  getStyle() {
    return Object.assign({}, this.get('style'));
  },

  /**
   * Set new style object
   * @param {Object} prop
   * @param {Object} opts
   */
  setStyle(prop = {}, opts = {}) {
    this.set('style', Object.assign({}, prop), opts);
  },

  /**
   * Add style property
   * @param {Object|string} prop
   * @param {string} value
   * @example
   * this.addStyle({color: 'red'});
   * this.addStyle('color', 'blue');
   */
  addStyle(prop, value = '', opts = {}) {
    if (typeof prop == 'string') {
      prop = {
        prop: value
      };
    } else {
      opts = value || {};
    }

    prop = this.extendStyle(prop);
    this.setStyle(prop, opts);
  },

  /**
   * Remove style property
   * @param {string} prop
   */
  removeStyle(prop) {
    let style = this.getStyle();
    delete style[prop];
    this.setStyle(style);
  }
}
