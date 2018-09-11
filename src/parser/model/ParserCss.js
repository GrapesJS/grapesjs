import BrowserCssParser from './BrowserParserCss';

module.exports = config => ({
  /**
   * Parse CSS string to a desired model object
   * @param  {String} str CSS string
   * @return {Array<Object>}
   */
  parse(str) {
    const { em } = config;
    const customParser = em.getCustomParserCss();
    return customParser ? customParser(str) : BrowserCssParser(str);
  }
});
