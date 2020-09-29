export default {
  stylePrefix: '',

  // Specify the element to use as a container, string (query) or HTMLElement
  // With the empty value, nothing will be rendered
  appendTo: '',

  // Enable/Disable globally the possibility to sort layers
  sortable: 1,

  // Enable/Disable globally the possibility to hide layers
  hidable: 1,

  // Hide textnodes
  hideTextnode: 1,

  // Indicate a query string of the element to be selected as the root of layers.
  // By default the root is the wrapper
  root: '',

  // Indicates if the wrapper is visible in layers
  showWrapper: 1,

  // Show hovered components in canvas
  showHover: 1,

  // Scroll to selected component in Canvas when it's selected in Layers
  // true, false or `scrollIntoView`-like options,
  // `block: 'nearest'` avoids the issue of window scolling
  scrollCanvas: { behavior: 'smooth', block: 'nearest' },

  // Scroll to selected component in Layers when it's selected in Canvas
  // true, false or `scrollIntoView`-like options
  scrollLayers: { behavior: 'auto', block: 'nearest' },

  // Highlight when a layer component is hovered
  highlightHover: 1
};
