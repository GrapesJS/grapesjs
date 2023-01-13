export interface DomComponentsConfig {
  stylePrefix?: string;

  /**
   * Could be used for default components.
   */
  components?: Record<string, any>[];

  /**
   * If the component is draggable you can drag the component itself (not only from the toolbar).
   * @default true
   */
  draggableComponents?: boolean;

  /**
   * You can setup a custom component definition processor before adding it into the editor.
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
  processor?: (obj: any) => Record<string, any> | undefined;

  /**
   * List of HTML void elements.
   * https://www.w3.org/TR/2011/WD-html-markup-20110113/syntax.html#void-elements
   */
  voidElements?: string[];
}

export default {
  stylePrefix: 'comp-',
  components: [],
  draggableComponents: true,
  processor: undefined,
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
    'wbr',
  ],
} as DomComponentsConfig;
