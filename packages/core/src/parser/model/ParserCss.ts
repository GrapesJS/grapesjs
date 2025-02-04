import { isString } from 'underscore';
import { CssRuleJSON } from '../../css_composer/model/CssRule';
import EditorModel from '../../editor/model/Editor';
import { ParsedCssRule, ParserConfig } from '../config/config';
import BrowserCssParser, { parseSelector, createNode } from './BrowserParserCss';
import { ParserEvents } from '../types';

const ParserCss = (em?: EditorModel, config: ParserConfig = {}) => ({
  /**
   * Parse CSS string to a desired model object
   * @param  {String} str CSS string
   * @return {Array<Object>}
   */
  parse(str: string, opts: { throwOnError?: boolean } = {}) {
    let output: CssRuleJSON[] = [];
    const { parserCss } = config;
    const editor = em?.Editor;
    let nodes: CssRuleJSON[] | ParsedCssRule[] = [];
    let error: unknown;
    const Parser = em?.Parser;
    const inputOptions = { input: str };
    Parser?.__emitEvent(ParserEvents.cssBefore, inputOptions);
    const { input } = inputOptions;

    try {
      nodes = parserCss ? parserCss(input, editor!) : BrowserCssParser(input);
    } catch (err) {
      error = err;
      if (opts.throwOnError) throw err;
    }

    nodes.forEach((node) => (output = output.concat(this.checkNode(node))));
    Parser?.__emitEvent(ParserEvents.css, { input, output, nodes, error });

    return output;
  },

  /**
   * Check the returned node from a custom parser and transforms it to
   * a valid object for the CSS composer
   * @return {[type]}
   */
  checkNode(node: CssRuleJSON | ParsedCssRule): CssRuleJSON[] {
    const { selectors, style } = node;
    let result = [node] as CssRuleJSON[];

    if (isString(selectors)) {
      const nodes: CssRuleJSON[] = [];
      const parsedNode = node as ParsedCssRule;
      const selsParsed = parseSelector(selectors);
      const classSets = selsParsed.result;
      const selectorsAdd = selsParsed.add.join(', ');
      const opts = { atRule: parsedNode.atRule, mediaText: parsedNode.params };

      if (classSets.length) {
        classSets.forEach((classSet) => {
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

export default ParserCss;
