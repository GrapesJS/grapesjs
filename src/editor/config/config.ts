export interface EditorConfig {

  /**
   * The html target element.
   */
  container?: string;

  plugins?: any[];
  pluginsOpts?: {[p: string]: any};
  autorender?: boolean;
  // Style prefix
  stylePrefix?: string;

  // HTML string or object of components
  components?: string;

  // CSS string or object of rules
  style?: string;

  // If true, will fetch HTML and CSS from selected container
  fromElement?: boolean;

  // Show an alert before unload the page with unsaved changes
  noticeOnUnload?: boolean;

  // Show paddings and margins
  showOffsets?: boolean;

  // Show paddings and margins on selected component
  showOffsetsSelected?: boolean;

  // On creation of a new Component (via object), if the 'style' attribute is not
  // empty, all those roles will be moved in its new class
  forceClass?: boolean;

  // Height for the editor container
  height?: string;

  // Width for the editor container
  width?: string;

  // Type of logs to print with the logger (by default is used the devtool console).
  // Available by default: debug, info, warning, error
  // You can use `false` to disable all of them or `true` to print all of them
  log?: string[];

  // By default Grapes injects base CSS into the canvas. For example, it sets body margin to 0
  // and sets a default background color of white. This CSS is desired in most cases.
  // use this property if you wish to overwrite the base CSS to your own CSS. This is most
  // useful if for example your template is not based off a document with 0 as body margin.
  baseCss?: string;

  // CSS that could only be seen (for instance, inside the code viewer)
  protectedCss?: string;

  // CSS for the iframe which containing the canvas, useful if you need to custom something inside
  // (eg. the style of the selected component)
  canvasCss?: string;

  // Default command
  defaultCommand?: string;

  // Show a toolbar when the component is selected
  showToolbar?: boolean;

  // Allow script tag importing
  allowScripts?: boolean;

  // If true render a select of available devices
  showDevices?: boolean;

  // When enabled, on device change media rules won't be created
  devicePreviewMode?: boolean;

  // THe condition to use for media queries, eg. 'max-width'
  // Comes handy for mobile-first cases
  mediaCondition?: string;

  // Starting tag for variable inside scripts in Components
  tagVarStart?: string;

  // Ending tag for variable inside scripts in Components
  tagVarEnd?: string;

  // When false, removes empty text nodes when parsed, unless they contain a space
  keepEmptyTextNodes?: boolean;

  // Return JS of components inside HTML from 'editor.getHtml()'
  jsInHtml?: boolean;

  // Enable native HTML5 drag and drop
  nativeDnD?: boolean;

  // Enable multiple selection
  multipleSelection?: boolean;

  // Show the wrapper component in the final code, eg. in editor.getHtml()
  exportWrapper?: boolean;

  // The wrapper, if visible, will be shown as a `<body>`
  wrappesIsBody?: boolean;

  // Usually when you update the `style` of the component this changes the
  // element's `style` attribute. Unfortunately, inline styling doesn't allow
  // use of media queries (@media) or even pseudo selectors (eg. :hover).
  // When `avoidInlineStyle` is true all styles are inserted inside the css rule
  avoidInlineStyle?: boolean;

  // Avoid default properties from storable JSON data, like `components` and `styles`.
  // With this option enabled your data will be smaller (usefull if need to
  // save some storage space)
  avoidDefaults?: boolean;

  // (experimental)
  // The structure of components is always on the screen but it's not the same
  // for style rules. When you delete a component you might leave a lot of styles
  // which will never be used again, therefore they might be removed.
  // With this option set to true, styles not used from the CSS generator (so in
  // any case where `CssGenerator.build` is used) will be removed automatically.
  // But be careful, not always leaving the style not used mean you wouldn't
  // use it later, but this option comes really handy when deal with big templates.
  clearStyles?: boolean;

  // Specify the global drag mode of components. By default, components are moved
  // following the HTML flow. Two other options are available:
  // 'absolute' - Move components absolutely (design tools way)
  // 'translate' - Use translate CSS from transform property
  // To get more about this feature read: https://github.com/artf/grapesjs/issues/1936
  dragMode?: boolean;

  // Dom element
  el?: Element | string,

  // Configurations for Undo Manager
  //TODO: convert configs to ts
  undoManager?: any,

  //Configurations for Asset Manager
  assetManager?: any,

  //Configurations for Canvas
  canvas?: any,

  //Configurations for Layers
  layers?: any,

  //Configurations for Storage Manager
  storageManager?: any,

  //Configurations for Rich Text Editor
  rte?: any,

  //Configurations for DomComponents
  domComponents?: any,

  //Configurations for Modal Dialog
  modal?: any,

  //Configurations for Code Manager
  codeManager?: any,

  //Configurations for Panels
  panels?: any,

  //Configurations for Commands
  commands?: any,

  //Configurations for Css Composer
  cssComposer?: any,

  //Configurations for Selector Manager
  selectorManager?: any,

  //Configurations for Device Manager
  deviceManager?: any,

  //Configurations for Style Manager
  styleManager?: any,

  // Configurations for Block Manager
  blockManager?: any,

  // Configurations for Trait Manager
  traitManager?: any,

  // Texts
  textViewCode?: string,

  // Keep unused styles within the editor
  keepUnusedStyles?: boolean,

  // TODO
  multiFrames?: boolean
}

export const editorConfig: EditorConfig = {
  // Style prefix
  stylePrefix: 'gjs-',

  // HTML string or object of components
  components: '',

  // CSS string or object of rules
  style: '',

  // If true, will fetch HTML and CSS from selected container
  fromElement: false,

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
    html, body, #wrapper {
      min-height: 100%;
    }
    body {
      margin: 0;
      height: 100%;
      background-color: #fff
    }
    #wrapper {
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
  showToolbar: true,

  // Allow script tag importing
  allowScripts: false,

  // If true render a select of available devices
  showDevices: true,

  // When enabled, on device change media rules won't be created
  devicePreviewMode: false,

  // THe condition to use for media queries, eg. 'max-width'
  // Comes handy for mobile-first cases
  mediaCondition: 'max-width',

  // Starting tag for variable inside scripts in Components
  tagVarStart: '{[ ',

  // Ending tag for variable inside scripts in Components
  tagVarEnd: ' ]}',

  // When false, removes empty text nodes when parsed, unless they contain a space
  keepEmptyTextNodes: false,

  // Return JS of components inside HTML from 'editor.getHtml()'
  jsInHtml: true,

  // Enable native HTML5 drag and drop
  nativeDnD: true,

  // Enable multiple selection
  multipleSelection: true,

  // Show the wrapper component in the final code, eg. in editor.getHtml()
  exportWrapper: false,

  // The wrapper, if visible, will be shown as a `<body>`
  wrappesIsBody: true,

  // Usually when you update the `style` of the component this changes the
  // element's `style` attribute. Unfortunately, inline styling doesn't allow
  // use of media queries (@media) or even pseudo selectors (eg. :hover).
  // When `avoidInlineStyle` is true all styles are inserted inside the css rule
  avoidInlineStyle: false,

  // Avoid default properties from storable JSON data, like `components` and `styles`.
  // With this option enabled your data will be smaller (usefull if need to
  // save some storage space)
  avoidDefaults: true,

  // (experimental)
  // The structure of components is always on the screen but it's not the same
  // for style rules. When you delete a component you might leave a lot of styles
  // which will never be used again, therefore they might be removed.
  // With this option set to true, styles not used from the CSS generator (so in
  // any case where `CssGenerator.build` is used) will be removed automatically.
  // But be careful, not always leaving the style not used mean you wouldn't
  // use it later, but this option comes really handy when deal with big templates.
  clearStyles: false,

  // Specify the global drag mode of components. By default, components are moved
  // following the HTML flow. Two other options are available:
  // 'absolute' - Move components absolutely (design tools way)
  // 'translate' - Use translate CSS from transform property
  // To get more about this feature read: https://github.com/artf/grapesjs/issues/1936
  dragMode: false,

  // Dom element
  el: '',

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
  rte: {},

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
        name: 'Desktop',
        width: ''
      },
      {
        name: 'Tablet',
        width: '768px',
        widthMedia: '992px'
      },
      {
        name: 'Mobile landscape',
        width: '568px',
        widthMedia: '768px'
      },
      {
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
  keepUnusedStyles: false,

  // TODO
  multiFrames: false
};
