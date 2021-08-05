export default {
  textTags: ['br', 'b', 'i', 'u', 'a', 'ul', 'ol'],

  // Custom CSS parser
  parserCss: null,

  // Default DOMParser mime type
  // @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
  htmlType: 'text/html',

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
