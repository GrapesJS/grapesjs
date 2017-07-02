module.exports = {
  // Style prefix
  stylePrefix: 'gjs-',

  //TEMP
  components: '',

  // Enable/Disable possibility to copy(ctrl + c) & paste(ctrl + v) components
  copyPaste: true,

  // Show an alert before unload the page with unsaved changes
  noticeOnUnload: true,

  // Enable/Disable undo manager
  undoManager: true,

  // Show paddings and margins
  showOffsets: false,

  // Show paddings and margins on selected component
  showOffsetsSelected: false,

  // Clear the canvas when editor.render() is called
  clearOnRender: false,

  // Return JS of components inside HTML from 'editor.getHtml()'
  jsInHtml: true,

  // On creation of a new Component (via object), if the 'style' attribute is not
  // empty, all those roles will be moved in its new class
  forceClass: true,

  // Height for the editor container
  height: '900px',

  // Width for the editor container
  width: '100%',

  // CSS that could only be seen (for instance, inside the code viewer)
  protectedCss: '*{box-sizing: border-box;} body{margin: 0;}',

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

  // This option makes available custom component types also for loaded
  // elements inside canvas
  loadCompsOnRender: 1,

  // Dom element
  el: '',

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
    devices: [{
        name: 'Desktop',
        width: '',
      },{
        name: 'Tablet',
        width: '768px',
        widthMedia: '992px',
      },{
        name: 'Mobile landscape',
        width: '568px',
        widthMedia: '768px',
      },{
        name: 'Mobile portrait',
        width: '320px',
        widthMedia: '480px',
    }],
  },

  //Configurations for Style Manager
  styleManager: {

    sectors: [{
        name: 'General',
        open: false,
        buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
      },{
        name: 'Dimension',
        open: false,
        buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
      },{
        name: 'Typography',
        open: false,
        buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-shadow'],
        properties: [{
            property: 'text-align',
            list        : [
                {value: 'left', className: 'fa fa-align-left'},
                {value: 'center', className: 'fa fa-align-center' },
                {value: 'right', className: 'fa fa-align-right'},
                {value: 'justify', className: 'fa fa-align-justify'}
            ],
        }]
      },{
        name: 'Decorations',
        open: false,
        buildProps: ['border-radius-c', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
      },{
        name: 'Extra',
        open: false,
        buildProps: ['transition', 'perspective', 'transform'],
      }],

  },

  //Configurations for Block Manager
  blockManager: {},

};
