module.exports = {
  stylePrefix: 'comp-',

  wrapperId: 'wrapper',

  // Default wrapper configuration
  wrapper: {
    //classes: ['body'],
    removable: false,
    copyable: false,
    stylable: ['background','background-color','background-image', 'background-repeat','background-attachment','background-position'],
    draggable: false,
    badgable: false,
    components: [],
  },

  // Could be used for default components
  components: [],

  rte: {},

  // Class for new image component
  imageCompClass  : 'fa fa-picture-o',

  // Open assets manager on create of image component
  oAssetsOnCreate  : true,

  // List of void elements
  voidElements: ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'],
};
