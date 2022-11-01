/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/parser/config/config.ts)
 * ```js
 * const editor = grapesjs.init({
 *  parser: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const { Parser } = editor;
 * ```
 * ## Available Events
 * * `parse:html` - On HTML parse, an object containing the input and the output of the parser is passed as an argument
 * * `parse:css` - On CSS parse, an object containing the input and the output of the parser is passed as an argument
 *
 * ## Methods
 * * [getConfig](#getconfig)
 * * [parseHtml](#parsehtml)
 * * [parseCss](#parsecss)
 *
 * @module Parser
 */
import { Module } from '../abstract';
import EditorModel from '../editor/model/Editor';
import defaults, { HTMLParserOptions, ParserConfig } from './config/config';
import parserCss from './model/ParserCss';
import parserHtml from './model/ParserHtml';

export default class ParserModule extends Module<ParserConfig & { name?: string }> {
  parserHtml: ReturnType<typeof parserHtml>;
  parserCss: ReturnType<typeof parserCss>;

  constructor(em: EditorModel) {
    super(em, 'Parser', defaults);
    const { config } = this;
    this.parserCss = parserCss(em, config);
    this.parserHtml = parserHtml(em, config);
  }

  /**
   * Get the configuration object
   * @returns {Object} Configuration object
   * @example
   * console.log(Parser.getConfig())
   */
  getConfig() {
    return this.config;
  }

  /**
   * Parse HTML string and return the object containing the Component Definition
   * @param  {String} input HTML string to parse
   * @param  {Object} [options] Options
   * @param  {String} [options.htmlType] [HTML mime type](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#Argument02) to parse
   * @param  {Boolean} [options.allowScripts=false] Allow `<script>` tags
   * @param  {Boolean} [options.allowUnsafeAttr=false] Allow unsafe HTML attributes (eg. `on*` inline event handlers)
   * @returns {Object} Object containing the result `{ html: ..., css: ... }`
   * @example
   * const resHtml = Parser.parseHtml(`<table><div>Hi</div></table>`, {
   *   htmlType: 'text/html', // default
   * });
   * // By using the `text/html`, this will fix automatically all the HTML syntax issues
   * // Indeed the final representation, in this case, will be `<div>Hi</div><table></table>`
   * const resXml = Parser.parseHtml(`<table><div>Hi</div></table>`, {
   *   htmlType: 'application/xml',
   * });
   * // This will preserve the original format as, from the XML point of view, is a valid format
   */
  parseHtml(input: string, options: HTMLParserOptions = {}) {
    const { em, parserHtml } = this;
    parserHtml.compTypes = (em.Components.getTypes() || {}) as any;
    return parserHtml.parse(input, this.parserCss, options);
  }

  /**
   * Parse CSS string and return an array of valid definition objects for CSSRules
   * @param  {String} input CSS string to parse
   * @returns {Array<Object>} Array containing the result
   * @example
   * const res = Parser.parseCss('.cls { color: red }');
   * // [{ ... }]
   */
  parseCss(input: string) {
    return this.parserCss.parse(input);
  }

  destroy() {}
}
