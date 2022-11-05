import { AssetManagerConfig } from '../../asset_manager/config/config';
import { BlockManagerConfig } from '../../block_manager/config/config';
import { CanvasConfig } from '../../canvas/config/config';
import { CodeManagerConfig } from '../../code_manager/config/config';
import { CssComposerConfig } from '../../css_composer/config/config';
import { DeviceManagerConfig } from '../../device_manager/config/config';
import { I18nConfig } from '../../i18n/config';
import { ModalConfig } from '../../modal_dialog/config/config';
import { LayerManagerConfig } from '../../navigator/config/config';
import { PageManagerConfig } from '../../pages';
import { PanelsConfig } from '../../panels/config/config';
import { ParserConfig } from '../../parser/config/config';
import { RichTextEditorConfig } from '../../rich_text_editor/config/config';
import { SelectorManagerConfig } from '../../selector_manager/config/config';
import { UndoManagerConfig } from '../../undo_manager/config';

type AnyObject = Record<string, any>;

export interface EditorConfig {
  /**
   * Style class name prefix.
   * @default 'gjs-'
   */
  stylePrefix?: string;

  /**
   * Selector which indicates where render the editor.
   */
  container?: string | HTMLElement;

  /**
   * If true, auto-render the content
   * @default true
   */
  autorender?: boolean;

  /**
   * Array of plugins to execute on start.
   * @default []
   */
  plugins?: (string | Plugin)[];

  /**
   * Custom options for plugins
   * @default {}
   */
  pluginsOpts?: Record<string, any>;

  /**
   * Init headless editor.
   * @default false
   */
  headless?: boolean;

  /**
   * Initial project data (JSON containing your components/styles/etc) to load.
   */
  projectData?: AnyObject;

  /**
   * HTML string or object of components
   * @deprecated Rely on `projectData` option
   * @default ''
   */
  components?: string;

  /**
   * CSS string or object of rules
   * @deprecated Rely on `projectData` option
   * @default ''
   */
  style?: string;

  /**
   * If true, will fetch HTML and CSS from the selected container.
   * @deprecated
   * @default false
   */
  fromElement?: boolean;

  /**
   * Show an alert before unload the page with unsaved changes
   * @default true
   */
  noticeOnUnload?: boolean;

  /**
   * Show paddings and margins.
   * @default false
   */
  showOffsets?: boolean;

  /**
   * Show paddings and margins on selected component
   * @default false
   */
  showOffsetsSelected?: boolean;

  /**
   * On creation of a new Component (via object), if the 'style' attribute is not
   * empty, all those roles will be moved in its new class.
   * @default true
   */
  forceClass?: boolean;

  /**
   * Height for the editor container
   * @default '900px'
   */
  height?: string;

  /**
   * Width for the editor container
   * @default '100%'
   */
  width?: string;

  /**
   * Type of logs to print with the logger (by default is used the devtool console).
   * Available by default: debug, info, warning, error.
   * You can use `false` to disable all of them or `true` to print all of them.
   * @default ['warning', 'error']
   */
  log?: ('debug' | 'info' | 'warning' | 'error')[] | boolean;

  /**
   * By default Grapes injects base CSS into the canvas. For example, it sets body margin to 0
   * and sets a default background color of white. This CSS is desired in most cases.
   * use this property if you wish to overwrite the base CSS to your own CSS. This is most
   * useful if for example your template is not based off a document with 0 as body margin.
   * @deprecated in favor of `config.canvas.frameStyle`
   * @default ''
   */
  baseCss?: string;

  /**
   * CSS that could only be seen (for instance, inside the code viewer)
   * @default '* { box-sizing: border-box; } body {margin: 0;}'
   */
  protectedCss?: string;

  /**
   * CSS for the iframe which containing the canvas, useful if you need to customize
   * something inside (eg. the style of the selected component).
   * @default ''
   */
  canvasCss?: string;

  /**
   * Default command
   * @default 'select-comp'
   */
  defaultCommand?: string;

  /**
   * Show a toolbar when the component is selected
   * @default true
   */
  showToolbar?: boolean;

  // Allow script tag importing
  // @deprecated in favor of `config.parser.optionsHtml.allowScripts`
  // allowScripts: 0,

  /**
   * If true render a select of available devices
   * @default true
   */
  showDevices?: boolean;

  /**
   * When enabled, on device change media rules won't be created
   * @default false
   */
  devicePreviewMode?: boolean;

  /**
   * The condition to use for media queries, eg. 'max-width'.
   * Comes handy for mobile-first cases.
   * @default 'max-width'
   */
  mediaCondition?: string;

  /**
   * Starting tag for variable inside scripts in Components
   * @deprecated Rely on 'script-props' https://grapesjs.com/docs/modules/Components-js.html#passing-properties-to-scripts
   * @default '{[ '
   */
  tagVarStart?: string;

  /**
   * Ending tag for variable inside scripts in Components
   * @deprecated Rely on 'script-props' https://grapesjs.com/docs/modules/Components-js.html#passing-properties-to-scripts
   * @default ' ]}'
   */
  tagVarEnd?: string;

  /**
   * When false, removes empty text nodes when parsed, unless they contain a space.
   * @default false
   */
  keepEmptyTextNodes?: boolean;

  /**
   * Return JS of components inside HTML from 'editor.getHtml()'.
   * @default true
   */
  jsInHtml?: boolean;

  /**
   * Enable native HTML5 drag and drop.
   * @default true
   */
  nativeDnD?: boolean;

  /**
   * Enable multiple component selection.
   * @default true
   */
  multipleSelection?: boolean;

  // TODO
  /**
   * Pass default available options wherever `editor.getHtml()` is called.
   * @default {}
   */
  optsHtml?: Record<string, any>;
  /**
   * Pass default available options wherever `editor.getCss()` is called
   * @default {}
   */
  optsCss?: Record<string, any>;

  /**
   * Usually when you update the `style` of the component this changes the
   * element's `style` attribute. Unfortunately, inline styling doesn't allow
   * use of media queries (@media) or even pseudo selectors (eg. :hover).
   * When `avoidInlineStyle` is true all styles are inserted inside the css rule
   * @deprecated Don't use this option, we don't support inline styling anymore.
   */
  avoidInlineStyle?: boolean;

  /**
   * Avoid default properties from storable JSON data, like `components` and `styles`.
   * With this option enabled your data will be smaller (usefull if need to
   * save some storage space).
   * @default true
   */
  avoidDefaults?: boolean;

  /**
   * (experimental)
   * The structure of components is always on the screen but it's not the same
   * for style rules. When you delete a component you might leave a lot of styles
   * which will never be used again, therefore they might be removed.
   * With this option set to true, styles not used from the CSS generator (so in
   * any case where `CssGenerator.build` is used) will be removed automatically.
   * But be careful, not always leaving the style not used mean you wouldn't
   * use it later, but this option comes really handy when deal with big templates.
   * @default false
   */
  clearStyles?: boolean;

  /**
   * Specify the global drag mode of components. By default, components are moved
   * following the HTML flow. Two other options are available:
   * 'absolute' - Move components absolutely (design tools way)
   * 'translate' - Use translate CSS from transform property
   * To get more about this feature read: https://github.com/artf/grapesjs/issues/1936.
   */
  dragMode?: 'translate' | 'absolute';

  /**
   * When the editor is placed in a scrollable container (eg. modals) this might
   * cause elements inside the canvas (eg. floating toolbars) to be misaligned.
   * To avoid that, you can specify an array of DOM elements on which their scroll will
   * trigger the canvas update.
   * Be default, if the array is empty, the first parent element will be appended.
   * listenToEl: [document.querySelector('#scrollable-el')],
   * @default []
   * */
  listenToEl?: HTMLElement[];

  /**
   * Import asynchronously CSS to use as icons.
   * @default 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'
   * */
  cssIcons?: string;

  /**
   * Experimental: don't use.
   * Editor icons
   */
  icons?: AnyObject;

  /**
   * Configurations for I18n.
   */
  i18n?: I18nConfig;

  /**
   * Configurations for Undo Manager
   */
  undoManager?: UndoManagerConfig | boolean;

  /**
   * Configurations for Asset Manager.
   */
  assetManager?: AssetManagerConfig;

  /**
   * Configurations for Canvas.
   */
  canvas?: CanvasConfig;

  // TODO
  /**
   * Configurations for Storage Manager.
   */
  storageManager?: AnyObject | boolean;

  /**
   * Configurations for Rich Text Editor.
   */
  richTextEditor?: RichTextEditorConfig;

  // TODO
  /**
   * Configurations for DomComponents
   */
  domComponents?: AnyObject;

  /**
   * Configurations for Modal Dialog.
   */
  modal?: ModalConfig;

  /**
   * Configurations for Code Manager.
   */
  codeManager?: CodeManagerConfig;

  /**
   * Configurations for Panels.
   */
  panels?: PanelsConfig;

  // TODO
  /**
   * Configurations for Commands.
   */
  commands?: AnyObject;

  /**
   * Configurations for Css Composer.
   */
  cssComposer?: CssComposerConfig;

  /**
   * Configurations for Selector Manager.
   */
  selectorManager?: SelectorManagerConfig;

  /**
   * Configurations for Device Manager.
   */
  deviceManager?: DeviceManagerConfig;

  // TODO
  /**
   * Configurations for Style Manager.
   */
  styleManager?: AnyObject;

  /**
   * Configurations for Block Manager.
   */
  blockManager?: BlockManagerConfig;

  // TODO
  /**
   * Configurations for Trait Manager.
   */
  traitManager?: AnyObject;

  /**
   * Configurations for Page Manager.
   */
  pageManager?: PageManagerConfig;

  /**
   * Configurations for Layer Manager.
   */
  layerManager?: LayerManagerConfig;

  /**
   * Configurations for Parser module.
   */
  parser?: ParserConfig;

  /** Texts **/
  textViewCode?: string;

  /**
   * Keep unused styles within the editor.
   * @default false
   */
  keepUnusedStyles?: boolean;

  /**
   * Experimental: don't use.
   * Avoid default UI styles.
   */
  customUI?: boolean;
  el?: HTMLElement;
  multiFrames?: boolean;
  /**
   * Color picker options.
   */
  colorPicker?: AnyObject;
  pStylePrefix?: string;
}

export type EditorConfigKeys = keyof EditorConfig;

const config: EditorConfig = {
  stylePrefix: 'gjs-',
  components: '',
  style: '',
  fromElement: false,
  projectData: undefined,
  noticeOnUnload: true,
  showOffsets: false,
  showOffsetsSelected: false,
  forceClass: true,
  height: '900px',
  width: '100%',
  log: ['warning', 'error'],
  baseCss: '',
  protectedCss: '* { box-sizing: border-box; } body {margin: 0;}',
  canvasCss: '',
  defaultCommand: 'select-comp',
  showToolbar: true,
  showDevices: true,
  devicePreviewMode: false,
  mediaCondition: 'max-width',
  tagVarStart: '{[ ',
  tagVarEnd: ' ]}',
  keepEmptyTextNodes: false,
  jsInHtml: true,
  nativeDnD: true,
  multipleSelection: true,
  optsHtml: {},
  optsCss: {},
  avoidInlineStyle: true,
  avoidDefaults: true,
  clearStyles: false,
  listenToEl: [],
  cssIcons: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
  icons: {
    close:
      '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>',
    move: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>',
    caret: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7,10L12,15L17,10H7Z" /></svg>',
    delete:
      '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>',
    copy: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></svg>',
    arrowUp:
      '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z" /></svg>',
    chevron:
      '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" /></svg>',
    eye: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" /></svg>',
    eyeOff:
      '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" /></svg>',
  },
  i18n: {},
  undoManager: {},
  assetManager: {},
  canvas: {},
  layerManager: {},
  storageManager: {},
  richTextEditor: {},
  domComponents: {},
  modal: {},
  codeManager: {},
  panels: {},
  commands: {},
  cssComposer: {},
  selectorManager: {},
  deviceManager: {},
  styleManager: {},
  blockManager: {},
  traitManager: {},
  textViewCode: 'Code',
  keepUnusedStyles: false,
  multiFrames: false,
  customUI: false,
};

export default config;
