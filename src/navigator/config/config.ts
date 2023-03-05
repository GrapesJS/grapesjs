export interface LayerManagerConfig {
  stylePrefix?: string;

  /**
   * Specify the element to use as a container, string (query) or HTMLElement.
   * With the empty value, nothing will be rendered.
   * @default ''
   */
  appendTo?: string | HTMLElement;

  /**
   * Enable/Disable globally the possibility to sort layers.
   * @default true
   */
  sortable?: boolean;

  /**
   * Enable/Disable globally the possibility to hide layers.
   * @default true
   */
  hidable?: boolean;

  /**
   * Hide textnodes.
   * @default true
   */
  hideTextnode?: boolean;

  /**
   * Indicate a query string of the element to be selected as the root of layers.
   * By default the root is the wrapper.
   * @default ''
   */
  root?: string;

  /**
   * Indicates if the wrapper is visible in layers.
   * @default true
   */
  showWrapper?: boolean;

  /**
   * Show hovered components in canvas.
   * @default true
   */
  showHover?: boolean;

  /**
   * Scroll to selected component in Canvas when it's selected in Layers.
   * true, false or `scrollIntoView`-like options,
   * `block: 'nearest'` avoids the issue of window scrolling.
   * @default { behavior: 'smooth', block: 'nearest' }
   */
  scrollCanvas?: boolean | ScrollIntoViewOptions;

  /**
   * Scroll to selected component in Layers when it's selected in Canvas.
   * @default { behavior: 'auto', block: 'nearest' }
   */
  scrollLayers?: boolean | ScrollIntoViewOptions;

  /**
   * Highlight when a layer component is hovered.
   * @default true
   */
  highlightHover?: boolean;

  /**
   * Avoid rendering the default layer manager.
   * @default false
   */
  custom?: boolean;

  /**
   * WARNING: Experimental option.
   * A callback triggered once the component layer is initialized.
   * Useful to trigger updates on some component prop change.
   * @example
   * onInit({ component, render, listenTo }) {
   *  listenTo(component, 'change:some-prop', render);
   * };
   */
  onInit?: () => void;

  /**
   * WARNING: Experimental option.
   * A callback triggered once the component layer is rendered.
   * A callback useful to update the layer DOM on some component change
   * @example
   * onRender({ component, el }) { // el is the DOM of the layer
   *  if (component.get('some-prop')) {
   *    // do changes using the `el` DOM
   *  }
   * }
   */
  onRender?: () => void;

  /**
   * Extend Layer view object (view/ItemView.js)
   * @example
   * extend: {
   *   setName(name) {
   *     // this.model is the component of the layer
   *     this.model.set('another-prop-for-name', name);
   *   },
   * },
   */
  extend?: Record<string, any>;
}

const config: LayerManagerConfig = {
  stylePrefix: '',
  appendTo: '',
  sortable: true,
  hidable: true,
  hideTextnode: true,
  root: '',
  showWrapper: true,
  showHover: true,
  scrollCanvas: { behavior: 'smooth', block: 'nearest' },
  scrollLayers: { behavior: 'auto', block: 'nearest' },
  highlightHover: true,
  custom: false,
  onInit: () => {},
  onRender: () => {},
  extend: {},
};

export default config;
