import { isString, isArray, keys, isUndefined } from 'underscore';
import { shallowDiff } from '../../utils/mixins';
import ParserHtml from '../../parser/model/ParserHtml';
import { Model } from '../../common';

const parserHtml = ParserHtml();

export default class StyleableModel extends Model {
  /**
   * Forward style string to `parseStyle` to be parse to an object
   * @param  {string} str
   * @returns
   */
  parseStyle(str) {
    return parserHtml.parseStyle(str);
  }

  /**
   * To trigger the style change event on models I have to
   * pass a new object instance
   * @param {Object} prop
   * @return {Object}
   */
  extendStyle(prop) {
    return { ...this.getStyle(), ...prop };
  }

  /**
   * Get style object
   * @return {Object}
   */
  getStyle(prop) {
    const style = this.get('style') || {};
    const result = { ...style };
    return prop && isString(prop) ? result[prop] : result;
  }

  /**
   * Set new style object
   * @param {Object|string} prop
   * @param {Object} opts
   * @return {Object} Applied properties
   */
  setStyle(prop = {}, opts = {}) {
    if (isString(prop)) {
      prop = this.parseStyle(prop);
    }

    const propOrig = this.getStyle(opts);
    const propNew = { ...prop };
    const newStyle = { ...propNew };
    // Remove empty style properties
    keys(newStyle).forEach(prop => {
      if (newStyle[prop] === '') {
        delete newStyle[prop];
      }
    });
    this.set('style', newStyle, opts);
    const diff = shallowDiff(propOrig, propNew);
    // Delete the property used for partial updates
    delete diff.__p;
    keys(diff).forEach(pr => {
      const em = this.em;
      if (opts.noEvent) return;
      this.trigger(`change:style:${pr}`);
      if (em) {
        em.trigger('styleable:change', this, pr, opts);
        em.trigger(`styleable:change:${pr}`, this, pr, opts);
      }
    });

    return propNew;
  }

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
        prop: value,
      };
    } else {
      opts = value || {};
    }

    prop = this.extendStyle(prop);
    this.setStyle(prop, opts);
  }

  /**
   * Remove style property
   * @param {string} prop
   */
  removeStyle(prop) {
    let style = this.getStyle();
    delete style[prop];
    this.setStyle(style);
  }

  /**
   * Returns string of style properties
   * @param {Object} [opts={}] Options
   * @return {String}
   */
  styleToString(opts = {}) {
    const result = [];
    const style = this.getStyle(opts);

    for (let prop in style) {
      const imp = opts.important;
      const important = isArray(imp) ? imp.indexOf(prop) >= 0 : imp;
      const value = `${style[prop]}${important ? ' !important' : ''}`;
      const propPrv = prop.substr(0, 2) == '__';
      value && !propPrv && result.push(`${prop}:${value};`);
    }

    return result.join('');
  }

  getSelectors() {
    return this.get('selectors') || this.get('classes');
  }

  getSelectorsString(opts) {
    return this.selectorsToString ? this.selectorsToString(opts) : this.getSelectors().getFullString();
  }

  _validate(attr, opts) {
    return true;
  }
}
