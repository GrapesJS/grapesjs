export default {
  // Style prefix
  stylePrefix: 'clm-',

  // Specify the element to use as a container, string (query) or HTMLElement
  // With the empty value, nothing will be rendered
  appendTo: '',

  // Default selectors
  selectors: [],

  // States
  states: [{ name: 'hover' }, { name: 'active' }, { name: 'nth-of-type(2n)' }],

  // Custom selector name escaping strategy, eg.
  // name => name.replace(' ', '_')
  escapeName: 0,

  // Custom selected name strategy (the string you see after 'Selected')
  // ({ result, state, target }) => {
  //  return `${result} - ID: ${target.getId()}`
  // }
  selectedName: 0,

  // When you select a component in the canvas the selected Model (Component or CSS Rule)
  // is passed to the StyleManager which will be then able to be styled, these are the cases:
  // * Selected component doesn't have any classes: Component will be passed
  // * Selected component has at least one class: The CSS Rule will be passed
  //
  // With this option enabled, also in the second case, the Component will be passed.
  // This method allows to avoid styling classes directly and make, for example, some
  // unintended changes below the visible canvas area (when components share same classes)
  componentFirst: 1
};
