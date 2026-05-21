import { OptionAsDocument } from '../../common';
import Editor from '../../editor';
import type { CustomParserCodeFunction, ParsedCssRule, ParsedElementNode, SyntheticElementCtor } from '../types';

export type CustomParserCss = (input: string, editor: Editor) => ParsedCssRule[];

export type CustomParserHtml = (input: string, options: HTMLParserOptions) => HTMLElement;

export type ConvertAttributeValuesOption =
  | boolean
  | readonly string[]
  | ((props: { attribute: string; value: string | boolean; node: HTMLElement | ParsedElementNode }) => boolean);

export interface ParseNodeOptions extends HTMLParserOptions {
  inSvg?: boolean;
  skipChildren?: boolean;
}

export interface HTMLParserOptions extends OptionAsDocument {
  /**
   * Default custom parser from the code parser registry.
   */
  parserCode?: string;

  /**
   * DOMParser mime type.
   * If you use the `text/html` parser, it will fix the invalid syntax automatically.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
   * @default 'text/html'
   */
  htmlType?: DOMParserSupportedType;

  /**
   * Allow <script> tags.
   * @default false
   */
  allowScripts?: boolean;

  /**
   * Allow unsafe HTML attributes (eg. `on*` inline event handlers).
   * @default false
   */
  allowUnsafeAttr?: boolean;

  /**
   * Allow unsafe HTML attribute values (eg. `src="javascript:..."`).
   * @default false
   */
  allowUnsafeAttrValue?: boolean;

  /**
   * When false, removes empty text nodes when parsed, unless they contain a space.
   * @default false
   */
  keepEmptyTextNodes?: boolean;

  /**
   * Indicate if or how to detect if the passed HTML string should be parsed as a document.
   */
  detectDocument?: boolean | ((html: string) => boolean);

  /**
   * Custom transformer to run before passing the input HTML to the parser.
   * A common use case might be to sanitize the input string.
   * @example
   * preParser: htmlString => DOMPurify.sanitize(htmlString)
   */
  preParser?: (input: string, opts: { editor: Editor }) => string;

  /**
   * Configures whether `data-gjs-*` attributes should be automatically converted from hyphenated to camelCase.
   *
   * When `true`:
   * - Hyphenated `data-gjs-*` attributes (e.g., `data-gjs-my-component`) are transformed into camelCase (`data-gjs-myComponent`).
   * - If `defaults` contains the camelCase version and not the original attribute, the camelCase will be used; otherwise, the original name is kept.
   *
   * @default false
   */
  convertDataGjsAttributesHyphens?: boolean;

  /**
   * Convert regular HTML attribute values using the same parser used by `data-gjs-*` attributes.
   *
   * - `true`: converts all regular attributes.
   * - `string[]`: converts only the listed attributes, matched by exact attribute name.
   * - `Function`: converts attributes when the function returns `true`.
   *
   * @default false
   */
  convertAttributeValues?: ConvertAttributeValuesOption;
}

export interface ParserConfig {
  /**
   * Let the editor know which HTML tags should be treated as part of the text component.
   * @default ['br', 'b', 'i', 'u', 'a', 'ul', 'ol']
   */
  textTags?: string[];

  /**
   * Let the editor know which Component types should be treated as part of the text component.
   * @default ['text', 'textnode', 'comment']
   */
  textTypes?: string[];

  /**
   * Custom CSS parser.
   * @see https://grapesjs.com/docs/guides/Custom-CSS-parser.html
   */
  parserCss?: CustomParserCss;

  /**
   * Custom HTML parser.
   * At the moment, the custom HTML parser should rely on DOM Node instance as the result.
   * @example
   * // The return should be an instance of an Node as the root to traverse
   * // https://developer.mozilla.org/en-US/docs/Web/API/Node
   * // Here the result will be XMLDocument, which extends Node.
   * parserHtml: (input, opts = {}) => (new DOMParser()).parseFromString(input, 'text/xml')
   */
  parserHtml?: CustomParserHtml;

  /**
   * Custom HTML code parsers registry.
   */
  parsersCode?: Record<string, CustomParserCodeFunction>;

  /**
   * Selected HTML code parser from the registry.
   */
  parserCode?: string;

  /**
   * Extend the default synthetic element used to bridge legacy `isComponent` checks
   * when parsing with `parserCode`.
   */
  customSyntheticElement?: (SyntheticElement: SyntheticElementCtor) => SyntheticElementCtor;

  /**
   * Default HTML parser options (used in `parserModule.parseHtml('<div...', options)`).
   */
  optionsHtml?: HTMLParserOptions;
}

const config: () => ParserConfig = () => ({
  textTags: ['br', 'b', 'i', 'u', 'a', 'ul', 'ol'],
  textTypes: ['text', 'textnode', 'comment'],
  parserCss: undefined,
  parserHtml: undefined,
  parsersCode: {},
  parserCode: undefined,
  customSyntheticElement: undefined,
  optionsHtml: {
    parserCode: undefined,
    htmlType: 'text/html',
    allowScripts: false,
    allowUnsafeAttr: false,
    allowUnsafeAttrValue: false,
    keepEmptyTextNodes: false,
    convertDataGjsAttributesHyphens: false,
    convertAttributeValues: false,
  },
});

export default config;
