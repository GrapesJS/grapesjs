export default {

  /**
   * To trigger the style change event on models I have to
   * pass a new object instance
   * @param {Object} prop
   * @return {Object}
   */
  newStyle(prop) {
    return Object.assign({}, this.getStyle(), prop);
  },

  /**
   * Get style object
   * @return {Object}
   */
  getStyle() {
    return this.get('style');
  },

  /**
   * Set new style object
   * @param {Object} prop
   */
  setStyle(prop = {}) {
    this.set('style', this.newStyle(prop));
  },

  /**
   * Add style property
   * @param {Object|string} prop
   * @param {string} value
   * @example
   * this.addStyle({color: 'red'});
   * this.addStyle('color', 'blue');
   */
  addStyle(prop, value = '') {
    if (typeof prop == 'string') {
      prop = {
        prop: value
      };
    }

    prop = this.newStyle(prop);
    this.set('style', prop);
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
