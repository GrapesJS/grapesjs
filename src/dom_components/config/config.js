export default {
  stylePrefix: 'comp-',

  // Could be used for default components
  components: [],

  // If the component is draggable you can drag the component itself (not only from the toolbar)
  draggableComponents: 1,

  // Generally, if you don't edit the wrapper in the editor, like
  // custom attributes, you don't need the wrapper stored in your JSON
  // structure, but in case you need it you can use this option.
  // If you have `config.avoidInlineStyle` disabled the wrapper will be stored
  // as we need to store inlined style.
  storeWrapper: 0,

  /**
   * You can setup a custom component definiton processor before adding it into the editor.
   * It might be useful to transform custom objects (es. some framework specific JSX) to GrapesJS component one.
   * This custom function will be executed on ANY new added component to the editor so make smart checks/conditions
   * to avoid doing useless executions
   * By default, GrapesJS supports already elements generated from React JSX preset
   * @example
   * processor: (obj) => {
   *  if (obj.$$typeof) { // eg. this is a React Element
   *     const gjsComponent = {
   *      type: obj.type,
   *      components: obj.props.children,
   *      ...
   *     };
   *     ...
   *     return gjsComponent;
   *  }
   * }
   */
  processor: 0,

  // List of void elements
  voidElements: [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'menuitem',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ]
};
