module.exports = {
  stylePrefix: 'comp-',

  wrapperId: 'wrapper',

  wrapperName: 'Body',

  // Default wrapper configuration
  wrapper: {
    // Need this property for exports
    wrapper: 1,
    style: {margin: 0},
    removable: false,
    copyable: false,
    draggable: false,
    badgable: false,
    components: [],
    stylable: ['background','background-color','background-image',
      'background-repeat','background-attachment','background-position'],
  },

  // Could be used for default components
  components: [],

  // Class for new image component
  imageCompClass  : 'fa fa-picture-o',

  // Open assets manager on create of image component
  oAssetsOnCreate  : true,

  // List of void elements
  voidElements: ['area', 'base', 'br', 'col', 'embed', 'hr', 'img',
    'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source',
    'track', 'wbr'],
};
