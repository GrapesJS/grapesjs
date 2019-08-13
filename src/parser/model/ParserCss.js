import { isString } from 'underscore';
import BrowserCssParser, {
  parseSelector,
  createNode
} from './BrowserParserCss';

export default (config = {}) => ({
  /**
   * Parse CSS string to a desired model object
   * @param  {String} str CSS string
   * @return {Array<Object>}
   */
  parse(str) {
    let result = [];
    const { parserCss, em = {} } = config;
    const editor = em && em.get && em.get('Editor');
    const nodes = parserCss ? parserCss(str, editor) : BrowserCssParser(str);
    nodes.forEach(node => (result = result.concat(this.checkNode(node))));

    return result;
  },

  /**
   * Check the returned node from a custom parser and transforms it to
   * a valid object for the CSS composer
   * @return {[type]}
   */
  checkNode(node) {
    const { selectors, style } = node;

    if (isString(selectors)) {
      const nodes = [];
      const selsParsed = parseSelector(selectors);
      const classSets = selsParsed.result;
      const selectorsAdd = selsParsed.add.join(', ');
      const opts = {
        atRule: node.atRule,
        mediaText: node.params
      };

      if (classSets.length) {
        classSets.forEach(classSet => {
          nodes.push(createNode(classSet, style, opts));
        });
      } else {
        nodes.push(createNode([], style, opts));
      }

      if (selectorsAdd) {
        const lastNode = nodes[nodes.length - 1];
        lastNode.selectorsAdd = selectorsAdd;
      }

      node = nodes;
    }

    return node;
  }
});
