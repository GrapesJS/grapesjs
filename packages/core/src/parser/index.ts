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
 * * [addParserCode](#addparsercode)
 * * [getParserCode](#getparsercode)
 * * [removeParserCode](#removeparsercode)
 *
 * @module Parser
 */
import { Module } from '../abstract';
import { ObjectAny } from '../common';
import EditorModel from '../editor/model/Editor';
import defConfig, { HTMLParserOptions, ParserConfig } from './config/config';
import ParserCss from './model/ParserCss';
import ParserHtml from './model/ParserHtml';
import { CustomParserCode, CustomParserCodeFunction, ParserEvents } from './types';

export default class ParserModule extends Module<ParserConfig & { name?: string }> {
  parserHtml: ParserHtml;
  parserCss: ParserCss;
  parsersCode = new Map<string, CustomParserCode>();
  events = ParserEvents;
  private _parserCode = '';

  constructor(em: EditorModel) {
    super(em, 'Parser', defConfig());
    const { config } = this;
    this.parserCss = new ParserCss(em, config);
    this.parserHtml = new ParserHtml(em, config);
    const { parserCode } = config;
    Object.entries(config.parsersCode || {}).forEach(([id, parser]) => this.addParserCode(id, parser));
    if (parserCode !== undefined) {
      this.parserCode = parserCode;
    }
  }

  get parserCode() {
    return this._parserCode;
  }

  set parserCode(value: string) {
    this._parserCode = value || '';
    this.getConfig().parserCode = this._parserCode;
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
   * @param  {String} [options.parserCode] Use a specific parser from the code parser registry. Pass an empty string to force the built-in/legacy parser path.
   * @param  {Function} [options.preParser] How to pre-process the HTML string before parsing
   * @param  {Boolean} [options.convertDataGjsAttributesHyphens=false] Convert `data-gjs-*` attributes from hyphenated to camelCase (eg. `data-gjs-my-component` to `data-gjs-myComponent`)
   * @param  {Boolean|Array<String>|Function} [options.convertAttributeValues=false] Convert regular HTML attribute values using the same parser used by `data-gjs-*` attributes
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

  /**
   * Add a new HTML code parser to the registry.
   * @param {string} id Parser ID
   * @param {Function} parse Parser function
   * @param {Object} [options={}] Parser options
   * @param {Boolean} [options.skipSelect=false] Avoid selecting the added parser as default
   * @returns {Object} Added parser definition
   */
  addParserCode(id: string, parse: CustomParserCodeFunction, options: { skipSelect?: boolean } = {}) {
    const parser = { id, parse };
    this.parsersCode.set(id, parser);
    !options.skipSelect && (this.parserCode = id);
    return parser;
  }

  /**
   * Get an HTML code parser by id.
   * @param {string} id Parser ID
   * @returns {Object|undefined} Parser definition
   */
  getParserCode(id: string) {
    return this.parsersCode.get(id);
  }

  /**
   * Remove an HTML code parser from the registry.
   * @param {string} id Parser ID
   * @returns {Object|undefined} Removed parser definition
   */
  removeParserCode(id: string) {
    const parser = this.parsersCode.get(id);
    if (!parser) return;
    this.parsersCode.delete(id);
    this.parserCode === id && (this.parserCode = '');
    return parser;
  }

  __emitEvent(event: string, data: ObjectAny) {
    const { em, events } = this;
    em.trigger(event, data);
    em.trigger(events.all, { event, ...data } as any);
  }

  destroy() {}
}
