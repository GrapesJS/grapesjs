export default {
  // Style prefix
  stylePrefix: 'gjs-',

  // HTML string or object of components
  components: '',

  // CSS string or object of rules
  style: '',

  // If true, will fetch HTML and CSS from selected container
  fromElement: 0,

  // Show an alert before unload the page with unsaved changes
  noticeOnUnload: true,

  // Show paddings and margins
  showOffsets: false,

  // Show paddings and margins on selected component
  showOffsetsSelected: false,

  // On creation of a new Component (via object), if the 'style' attribute is not
  // empty, all those roles will be moved in its new class
  forceClass: true,

  // Height for the editor container
  height: '900px',

  // Width for the editor container
  width: '100%',

  // Type of logs to print with the logger (by default is used the devtool console).
  // Available by default: debug, info, warning, error
  // You can use `false` to disable all of them or `true` to print all of them
  log: ['warning', 'error'],

  // By default Grapes injects base CSS into the canvas. For example, it sets body margin to 0
  // and sets a default background color of white. This CSS is desired in most cases.
  // use this property if you wish to overwrite the base CSS to your own CSS. This is most
  // useful if for example your template is not based off a document with 0 as body margin.
  baseCss: `
    * {
      box-sizing: border-box;
    }
    html, body, [data-gjs-type=wrapper] {
      min-height: 100%;
    }
    body {
      margin: 0;
      height: 100%;
      background-color: #fff
    }
    [data-gjs-type=wrapper] {
      overflow: auto;
      overflow-x: hidden;
    }

    * ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1)
    }

    * ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2)
    }

    * ::-webkit-scrollbar {
      width: 10px
    }
  `,

  // CSS that could only be seen (for instance, inside the code viewer)
  protectedCss: '* { box-sizing: border-box; } body {margin: 0;}',

  // CSS for the iframe which containing the canvas, useful if you need to custom something inside
  // (eg. the style of the selected component)
  canvasCss: '',

  // Default command
  defaultCommand: 'select-comp',

  // Show a toolbar when the component is selected
  showToolbar: 1,

  // Allow script tag importing
  allowScripts: 0,

  // If true render a select of available devices
  showDevices: 1,

  // When enabled, on device change media rules won't be created
  devicePreviewMode: 0,

  // THe condition to use for media queries, eg. 'max-width'
  // Comes handy for mobile-first cases
  mediaCondition: 'max-width',

  // Starting tag for variable inside scripts in Components
  tagVarStart: '{[ ',

  // Ending tag for variable inside scripts in Components
  tagVarEnd: ' ]}',

  // When false, removes empty text nodes when parsed, unless they contain a space
  keepEmptyTextNodes: 0,

  // Return JS of components inside HTML from 'editor.getHtml()'
  jsInHtml: true,

  // Enable native HTML5 drag and drop
  nativeDnD: 1,

  // Enable multiple selection
  multipleSelection: 1,

  // Show the wrapper component in the final code, eg. in editor.getHtml()
  exportWrapper: 0,

  // The wrapper, if visible, will be shown as a `<body>`
  wrapperIsBody: 1,

  // Usually when you update the `style` of the component this changes the
  // element's `style` attribute. Unfortunately, inline styling doesn't allow
  // use of media queries (@media) or even pseudo selectors (eg. :hover).
  // When `avoidInlineStyle` is true all styles are inserted inside the css rule
  // @deprecated Don't use this option, we don't support inline styling anymore
  avoidInlineStyle: 1,

  // Avoid default properties from storable JSON data, like `components` and `styles`.
  // With this option enabled your data will be smaller (usefull if need to
  // save some storage space)
  avoidDefaults: 1,

  // (experimental)
  // The structure of components is always on the screen but it's not the same
  // for style rules. When you delete a component you might leave a lot of styles
  // which will never be used again, therefore they might be removed.
  // With this option set to true, styles not used from the CSS generator (so in
  // any case where `CssGenerator.build` is used) will be removed automatically.
  // But be careful, not always leaving the style not used mean you wouldn't
  // use it later, but this option comes really handy when deal with big templates.
  clearStyles: 0,

  // Specify the global drag mode of components. By default, components are moved
  // following the HTML flow. Two other options are available:
  // 'absolute' - Move components absolutely (design tools way)
  // 'translate' - Use translate CSS from transform property
  // To get more about this feature read: https://github.com/artf/grapesjs/issues/1936
  dragMode: 0,

  // Import asynchronously CSS to use as icons
  cssIcons:
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',

  // Dom element
  el: '',

  // Configurations for I18n
  i18n: {},

  // Configurations for Undo Manager
  undoManager: {},

  //Configurations for Asset Manager
  assetManager: {},

  //Configurations for Canvas
  canvas: {},

  //Configurations for Layers
  layers: {},

  //Configurations for Storage Manager
  storageManager: {},

  //Configurations for Rich Text Editor
  richTextEditor: {},

  //Configurations for DomComponents
  domComponents: {},

  //Configurations for Modal Dialog
  modal: {},

  //Configurations for Code Manager
  codeManager: {},

  //Configurations for Panels
  panels: {},

  //Configurations for Commands
  commands: {},

  //Configurations for Css Composer
  cssComposer: {},

  //Configurations for Selector Manager
  selectorManager: {},

  //Configurations for Device Manager
  deviceManager: {
    devices: [
      {
        id: 'desktop',
        name: 'Desktop',
        width: ''
      },
      {
        id: 'tablet',
        name: 'Tablet',
        width: '768px',
        widthMedia: '992px'
      },
      {
        id: 'mobileLandscape',
        name: 'Mobile landscape',
        width: '568px',
        widthMedia: '768px'
      },
      {
        id: 'mobilePortrait',
        name: 'Mobile portrait',
        width: '320px',
        widthMedia: '480px'
      }
    ]
  },

  //Configurations for Style Manager
  styleManager: {
    sectors: [
      {
        name: 'General',
        open: false,
        buildProps: [
          'float',
          'display',
          'position',
          'top',
          'right',
          'left',
          'bottom'
        ]
      },
      {
        name: 'Flex',
        open: false,
        buildProps: [
          'flex-direction',
          'flex-wrap',
          'justify-content',
          'align-items',
          'align-content',
          'order',
          'flex-basis',
          'flex-grow',
          'flex-shrink',
          'align-self'
        ]
      },
      {
        name: 'Dimension',
        open: false,
        buildProps: [
          'width',
          'height',
          'max-width',
          'min-height',
          'margin',
          'padding'
        ]
      },
      {
        name: 'Typography',
        open: false,
        buildProps: [
          'font-family',
          'font-size',
          'font-weight',
          'letter-spacing',
          'color',
          'line-height',
          'text-align',
          'text-shadow'
        ],
        properties: [
          {
            property: 'text-align',
            list: [
              { value: 'left', className: 'fa fa-align-left' },
              { value: 'center', className: 'fa fa-align-center' },
              { value: 'right', className: 'fa fa-align-right' },
              { value: 'justify', className: 'fa fa-align-justify' }
            ]
          }
        ]
      },
      {
        name: 'Decorations',
        open: false,
        buildProps: [
          'border-radius-c',
          'background-color',
          'border-radius',
          'border',
          'box-shadow',
          'background'
        ]
      },
      {
        name: 'Extra',
        open: false,
        buildProps: ['transition', 'perspective', 'transform']
      }
    ]
  },

  // Configurations for Block Manager
  blockManager: {},

  // Configurations for Trait Manager
  traitManager: {},

  // Texts
  textViewCode: 'Code',

  // Keep unused styles within the editor
  keepUnusedStyles: 0,

  // TODO
  multiFrames: 0
};
