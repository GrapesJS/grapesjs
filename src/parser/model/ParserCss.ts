import { isString } from 'underscore';
import { CssRuleProperties } from '../../css_composer/model/CssRule';
import EditorModel from '../../editor/model/Editor';
import BrowserCssParser, { parseSelector, createNode } from './BrowserParserCss';

export default (config: { parserCss?: any; em?: EditorModel } = {}) => ({
  /**
   * Parse CSS string to a desired model object
   * @param  {String} str CSS string
   * @return {Array<Object>}
   */
  parse(str: string) {
    let result: CssRuleProperties[] = [];
    const { parserCss, em } = config;
    const editor = em?.Editor;
    const nodes: CssRuleProperties[] = parserCss ? parserCss(str, editor) : BrowserCssParser(str);
    nodes.forEach(node => (result = result.concat(this.checkNode(node))));
    em?.trigger('parse:css', { input: str, output: result });

    return result;
  },

  /**
   * Check the returned node from a custom parser and transforms it to
   * a valid object for the CSS composer
   * @return {[type]}
   */
  checkNode(node: CssRuleProperties): CssRuleProperties[] {
    const { selectors, style } = node;
    let result = [node];

    if (isString(selectors)) {
      const nodes = [];
      const selsParsed = parseSelector(selectors);
      const classSets = selsParsed.result;
      const selectorsAdd = selsParsed.add.join(', ');
      // @ts-ignore
      const opts = { atRule: node.atRule, mediaText: node.params };

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

      result = nodes;
    }

    return result;
  },
});
