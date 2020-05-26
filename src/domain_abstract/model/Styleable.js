import { isString, isArray, keys } from 'underscore';
import { shallowDiff } from 'utils/mixins';
import ParserHtml from 'parser/model/ParserHtml';

const parseStyle = ParserHtml().parseStyle;

export default {
  parseStyle,

  /**
   * To trigger the style change event on models I have to
   * pass a new object instance
   * @param {Object} prop
   * @return {Object}
   */
  extendStyle(prop) {
    return { ...this.getStyle(), ...prop };
  },

  /**
   * Get style object
   * @return {Object}
   */
  getStyle() {
    const style = this.get('style') || {};
    return { ...style };
  },

  /**
   * Set new style object
   * @param {Object|string} prop
   * @param {Object} opts
   * @return {Object} Applied properties
   */
  setStyle(prop = {}, opts = {}) {
    if (isString(prop)) {
      prop = parseStyle(prop);
    }

    const propOrig = this.getStyle();
    const propNew = { ...prop };
    this.set('style', propNew, opts);
    const diff = shallowDiff(propOrig, propNew);
    keys(diff).forEach(pr => {
      const em = this.em;
      this.trigger(`change:style:${pr}`);
      if (em) {
        em.trigger(`styleable:change`, this, pr);
        em.trigger(`styleable:change:${pr}`, this, pr);
      }
    });

    return propNew;
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
  },

  /**
   * Returns string of style properties
   * @param {Object} [opts={}] Options
   * @return {String}
   */
  styleToString(opts = {}) {
    const result = [];
    const style = this.getStyle();

    for (let prop in style) {
      const imp = opts.important;
      const important = isArray(imp) ? imp.indexOf(prop) >= 0 : imp;
      const value = `${style[prop]}${important ? ' !important' : ''}`;
      const propPrv = prop.substr(0, 2) == '__';
      value && !propPrv && result.push(`${prop}:${value};`);
    }

    return result.join('');
  },

  getSelectors() {
    return this.get('selectors') || this.get('classes');
  },

  getSelectorsString() {
    return this.selectorsToString
      ? this.selectorsToString()
      : this.getSelectors().getFullString();
  }
};
