export default {
  // Style prefix
  stylePrefix: 'css-',

  // Default CSS style
  rules: [],

  /**
   * Adjust style object before creation/update.
   * @example
   * onBeforeStyle(style) {
   *    const padValue = style.padding;
   *    if (padValue === '10px') {
   *      delete style.padding;
   *      style['padding-top'] = padValue;
   *      // ...
   *    }
   *    return style;
   * }
   */
  onBeforeStyle: null
};
