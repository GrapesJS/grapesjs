import EditorModule from '../../editor';

export interface ParsedCssRule {
  selectors: string;
  style: Record<string, string>;
  atRule?: string;
  params?: string;
}

export type CustomParserCss = (input: string, editor: EditorModule) => ParsedCssRule[];

export type CustomParserHtml = (input: string, options: HTMLParserOptions) => HTMLElement;

export interface HTMLParserOptions {
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
   * When false, removes empty text nodes when parsed, unless they contain a space.
   * @default false
   */
  keepEmptyTextNodes?: boolean;
}

export interface ParserConfig {
  /**
   * Let the editor know which HTML tags should be treated as part of the text component.
   * @default ['br', 'b', 'i', 'u', 'a', 'ul', 'ol']
   */
  textTags?: string[];

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
   * Default HTML parser options (used in `parserModule.parseHtml('<div...', options)`).
   */
  optionsHtml?: HTMLParserOptions;
}

const config: ParserConfig = {
  textTags: ['br', 'b', 'i', 'u', 'a', 'ul', 'ol'],
  parserCss: undefined,
  parserHtml: undefined,
  optionsHtml: {
    htmlType: 'text/html',
    allowScripts: false,
    allowUnsafeAttr: false,
    keepEmptyTextNodes: false,
  },
};

export default config;
