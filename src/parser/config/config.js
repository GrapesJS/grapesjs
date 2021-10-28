export default {
  textTags: ['br', 'b', 'i', 'u', 'a', 'ul', 'ol'],

  // Custom CSS parser
  // @see https://grapesjs.com/docs/guides/Custom-CSS-parser.html
  parserCss: null,

  // Custom HTML parser
  // At the moment, the custom HTML parser should rely on DOM Node instance as the result
  // @example
  // The return should be an instance of an Node as the root to traverse
  // https://developer.mozilla.org/en-US/docs/Web/API/Node
  // parserHtml: (input, opts = {}) => (new DOMParser()).parseFromString(input, 'text/xml')
  // Here the result will be XMLDocument, which extends Node
  parserHtml: null,

  // DOMParser mime type (default 'text/html')
  // @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
  // If you use the `text/html` parser, it will fix the invalid syntax automatically
  htmlType: null
};
