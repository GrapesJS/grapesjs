module.exports = {

  // Style prefix
  stylePrefix: 'clm-',

  // Default classes
  selectors: [],

  // Label for classes
  label: 'Classes',

  // Label for states
  statesLabel: '- State -',

  // States
  states: [
      { name: 'hover', label: 'Hover' },
      { name: 'active', label: 'Click' },
      { name: 'nth-of-type(2n)', label: 'Even/Odd' }
  ],

  // Associate properties on selector creation
  // @example
  // // If 'row' or 'cell' class is added into template, make those selectors
  // // not visible by the user
  // propertyMap: {
  //   '.row, .cell': {
  //      private: true,
  //   }
  // },
  propertyMap: {
    '.row, .cell': {
      private: true,
    }
  },

};
