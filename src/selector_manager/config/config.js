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
  escapeName: 0
};
