/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/GrapesJS/grapesjs/blob/master/src/parser/config/config.ts)
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
 *
 * {REPLACE_EVENTS}
 *
 * ## Methods
 * * [getConfig](#getconfig)
 * * [parseHtml](#parsehtml)
 * * [parseCss](#parsecss)
 *
 * @module Parser
 */
import { Module } from '../abstract';
import { ObjectAny } from '../common';
import EditorModel from '../editor/model/Editor';
import defConfig, { HTMLParserOptions, ParserConfig } from './config/config';
import ParserCss from './model/ParserCss';
import ParserHtml from './model/ParserHtml';
import { ParserEvents } from './types';

export default class ParserModule extends Module<ParserConfig & { name?: string }> {
  parserHtml: ReturnType<typeof ParserHtml>;
  parserCss: ReturnType<typeof ParserCss>;
  events = ParserEvents;

  constructor(em: EditorModel) {
    super(em, 'Parser', defConfig());
    const { config } = this;
    this.parserCss = ParserCss(em, config);
    this.parserHtml = ParserHtml(em, config);
  }

  /**
   * Get configuration object
   * @name getConfig
   * @function
   * @return {Object}
   */

  /**
   * Parse HTML string and return the object containing the Component Definition
   * @param  {String} input HTML string to parse
   * @param  {Object} [options] Options
   * @param  {String} [options.htmlType] [HTML mime type](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#Argument02) to parse
   * @param  {Boolean} [options.allowScripts=false] Allow `<script>` tags
   * @param  {Boolean} [options.allowUnsafeAttr=false] Allow unsafe HTML attributes (eg. `on*` inline event handlers)
   * @param  {Boolean} [options.allowUnsafeAttrValue=false] Allow unsafe HTML attribute values (eg. `src="javascript:..."`)
   * @param  {Boolean} [options.keepEmptyTextNodes=false] Keep whitespaces regardless of whether they are meaningful
   * @param  {Boolean} [options.asDocument] Treat the HTML string as document
   * @param  {Boolean|Function} [options.detectDocument] Indicate if or how to detect if the HTML string should be treated as document
   * @param  {Function} [options.preParser] How to pre-process the HTML string before parsing
   * @param  {Boolean} [options.convertDataGjsAttributesHyphens=false] Convert `data-gjs-*` attributes from hyphenated to camelCase (eg. `data-gjs-my-component` to `data-gjs-myComponent`)
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
    parserHtml.compTypes = em.Components.getTypes() || [];
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

  __emitEvent(event: string, data: ObjectAny) {
    const { em, events } = this;
    em.trigger(event, data);
    em.trigger(events.all, { event, ...data });
  }

  destroy() {}
}
