import { isString } from 'underscore';
import BrowserCssParser from './BrowserParserCss';

module.exports = (config = {}) => ({
  /**
   * Parse CSS string to a desired model object
   * @param  {String} str CSS string
   * @return {Array<Object>}
   */
  parse(str) {
    let result = [];
    const customParser = config.parserCss;
    const nodes = customParser ? customParser(str) : BrowserCssParser(str);
    nodes.forEach(node => (result = result.concat(this.checkNode(node))));

    return result;
  },

  /**
   * Check the returned node from a custom parser and transforms it to
   * a valid object for the CSS composer
   * @return {[type]}
   */
  checkNode(node) {
    if (isString(node.selectors)) {
    }

    return node;
  }
});
