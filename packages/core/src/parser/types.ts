import { ObjectAny } from '../common';
import { CssRuleJSON } from '../css_composer/model/CssRule';
import { ComponentDefinitionDefined } from '../dom_components/model/types';
import Editor from '../editor';
import type { HTMLParserOptions } from './config/config';

export interface ParsedCssRule {
  selectors: string | string[];
  style: Record<string, string>;
  atRule?: string;
  params?: string;
}

export interface ParsedNode {
  nodeType?: number;
  tagName?: string;
  namespaceURI?: string;
  attributes?: Record<string, string>;
  childNodes?: ParsedNode[];
  textContent?: string;
}

export interface ParsedNodeMeta extends ParsedNode {
  __boolAttributes?: string[];
  __doctype?: string;
  __domNode?: any;
  __selfClosing?: boolean;
}

export enum ParsedNodeType {
  element = 1,
  text = 3,
  comment = 8,
  document = 9,
  fragment = 11,
}

export enum ParsedNodeNamespace {
  html = 'http://www.w3.org/1999/xhtml',
}

export type ParsedElementNode = ParsedNode & { tagName: string };

export interface CustomParserCodeContext {
  editor: Editor;
  options: HTMLParserOptions;
}

export type CustomParserCodeFunction = (input: string, props: CustomParserCodeContext) => ParsedNode[];

export interface CustomParserCode {
  id: string;
  parse: CustomParserCodeFunction;
}

export type SyntheticElementCtor = new (node: ParsedNode, parent?: any) => any;

export interface HTMLParseResult {
  html: ComponentDefinitionDefined | ComponentDefinitionDefined[];
  css?: CssRuleJSON[];
  doctype?: string;
  root?: ComponentDefinitionDefined;
  head?: ComponentDefinitionDefined;
}

/**{START_EVENTS}*/
export enum ParserEvents {
  /**
   * @event `parse:html` On HTML parse, an object containing the input and the output of the parser is passed as an argument.
   * @example
   * editor.on('parse:html', ({ input, output }) => { ... });
   */
  html = 'parse:html',
  htmlRoot = 'parse:html:root',

  /**
   * @event `parse:html:before` Event triggered before the HTML parsing starts. An object containing the input is passed as an argument.
   * @example
   * editor.on('parse:html:before', (options) => {
   *   console.log('Parser input', options.input);
   *   // You can also process the input and update `options.input`
   *   options.input += '<div>Extra content</div>';
   * });
   */
  htmlBefore = 'parse:html:before',

  /**
   * @event `parse:css` On CSS parse, an object containing the input and the output of the parser is passed as an argument.
   * @example
   * editor.on('parse:css', ({ input, output }) => { ... });
   */
  css = 'parse:css',

  /**
   * @event `parse:css:before` Event triggered before the CSS parsing starts. An object containing the input is passed as an argument.
   * @example
   * editor.on('parse:css:before', (options) => {
   *   console.log('Parser input', options.input);
   *   // You can also process the input and update `options.input`
   *   options.input += '.my-class { color: red; }';
   * });
   */
  cssBefore = 'parse:css:before',

  /**
   * @event `parse` Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
   * @example
   * editor.on('parse', ({ event, ... }) => { ... });
   */
  all = 'parse',
}
/**{END_EVENTS}*/

export type ParserEvent = `${ParserEvents}`;

export interface ParserEventCallback {
  [ParserEvents.htmlBefore]: [{ input: string }];
  [ParserEvents.htmlRoot]: [{ input: string; root: ParsedNode }];
  [ParserEvents.html]: [{ input: string; output: HTMLParseResult; options: HTMLParserOptions }];
  [ParserEvents.cssBefore]: [{ input: string }];
  [ParserEvents.css]: [
    { input: string; output: CssRuleJSON[]; nodes: Array<CssRuleJSON | ParsedCssRule>; error: unknown },
  ];
  [ParserEvents.all]: [{ event: ParserEvent; input: string } & ObjectAny];
}

// need this to avoid the TS documentation generator to break
export default ParserEvents;
