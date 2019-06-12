module.exports = {
  stylePrefix: 'comp-',

  wrapperId: 'wrapper',

  wrapperName: 'Body',

  // Default wrapper configuration
  wrapper: {
    removable: false,
    copyable: false,
    draggable: false,
    components: [],
    traits: [],
    stylable: [
      'background',
      'background-color',
      'background-image',
      'background-repeat',
      'background-attachment',
      'background-position',
      'background-size'
    ]
  },

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
