export default {
  textTags: ['br', 'b', 'i', 'u', 'a', 'ul', 'ol'],

  // Custom CSS parser
  parserCss: null,

  // DOMParser mime type (default 'text/html')
  // @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
  htmlType: null,

  // Custom function which tells which root Element to extract
  // from the DOMParser.parseFromString result
  // @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
  // @example
  // // with htmlType as 'text/html' the function will be (default):
  // htmlResult: (doc) => doc.body,
  // // in case of `application/xml`
  // htmlResult: (doc) => doc,
  htmlResult: null,

  // TODO: Custom HTML parser
  parserHtml: null
};
