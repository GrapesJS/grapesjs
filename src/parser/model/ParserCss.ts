import { isString } from 'underscore';
import { CssRuleProperties } from '../../css_composer/model/CssRule';
import EditorModel from '../../editor/model/Editor';
import { ParsedCssRule, ParserConfig } from '../config/config';
import BrowserCssParser, { parseSelector, createNode } from './BrowserParserCss';

export default (em?: EditorModel, config: ParserConfig = {}) => ({
  /**
   * Parse CSS string to a desired model object
   * @param  {String} str CSS string
   * @return {Array<Object>}
   */
  parse(str: string) {
    let result: CssRuleProperties[] = [];
    const { parserCss } = config;
    const editor = em?.Editor;
    const nodes = parserCss ? parserCss(str, editor!) : BrowserCssParser(str);
    nodes.forEach(node => (result = result.concat(this.checkNode(node))));
    em?.trigger('parse:css', { input: str, output: result });

    return result;
  },

  /**
   * Check the returned node from a custom parser and transforms it to
   * a valid object for the CSS composer
   * @return {[type]}
   */
  checkNode(node: CssRuleProperties | ParsedCssRule): CssRuleProperties[] {
    const { selectors, style } = node;
    let result = [node] as CssRuleProperties[];

    if (isString(selectors)) {
      const nodes: CssRuleProperties[] = [];
      const parsedNode = node as ParsedCssRule;
      const selsParsed = parseSelector(selectors);
      const classSets = selsParsed.result;
      const selectorsAdd = selsParsed.add.join(', ');
      const opts = { atRule: parsedNode.atRule, mediaText: parsedNode.params };

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
