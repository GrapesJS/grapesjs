module.exports = {
  stylePrefix: 'comp-',

  wrapperId: 'wrapper',

  wrapperName: 'Body',

  // Default wrapper configuration
  wrapper: {
    style: {margin: 0},
    removable: false,
    copyable: false,
    draggable: false,
    components: [],
    traits: [],
    stylable: ['background','background-color','background-image',
      'background-repeat','background-attachment','background-position',
      'background-size'],
  },

  // Usually when you update the `style` of the component this changes the
  // element's `style` attribute. Unfortunately, inline styling doesn't allow
  // use of media queries (@media) or even pseudo selectors (eg. :hover).
  // When `avoidInlineStyle` is true all the styles are inserted inside the
  // relative css rule
  avoidInlineStyle: 0,

  // Could be used for default components
  components: [],

  // Class for new image component
  imageCompClass: 'fa fa-picture-o',

  // Open assets manager on create of image component
  oAssetsOnCreate: true,

  // TODO to remove
  // Editor should also store the wrapper informations, but as this change might
  // break stuff I set ii as an opt-in option, for now.
  storeWrapper: 0,

  // List of void elements
  voidElements: ['area', 'base', 'br', 'col', 'embed', 'hr', 'img',
    'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source',
    'track', 'wbr'],
};
