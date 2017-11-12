import { isString } from 'underscore';
import ParserHtml from 'parser/model/ParserHtml';

const parseStyle = ParserHtml().parseStyle;
export default {

  /**
   * To trigger the style change event on models I have to
   * pass a new object instance
   * @param {Object} prop
   * @return {Object}
   */
  extendStyle(prop) {
    return { ...this.getStyle(), ...prop};
  },

  /**
   * Get style object
   * @return {Object}
   */
  getStyle() {
    return { ...this.get('style') };
  },

  /**
   * Set new style object
   * @param {Object|string} prop
   * @param {Object} opts
   */
  setStyle(prop = {}, opts = {}) {
    if (isString(prop)) {
      prop = parseStyle(prop);
    }

    this.set('style', { ...prop }, opts);

    for (let pr in prop) {
      this.trigger(`change:style:${pr}`);
    }
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
