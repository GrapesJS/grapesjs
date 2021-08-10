export default {
  textTags: ['br', 'b', 'i', 'u', 'a', 'ul', 'ol'],

  // Custom CSS parser
  // @see https://grapesjs.com/docs/guides/Custom-CSS-parser.html
  parserCss: null,

  // DOMParser mime type (default 'text/html')
  // @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
  // If you use the `text/html` parser, it will fix the invalid syntax automatically
  htmlType: null,

  // TODO: Custom HTML parser
  parserHtml: null
};
