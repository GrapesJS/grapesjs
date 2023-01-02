declare namespace Backbone {
  interface ModelProperties { }

  class Model<T extends ModelProperties> {
    constructor(attr?: T, opt?: any);
    attributes: T;
    collection: Collection<this>;
    cid: string;
    get<K extends keyof T>(prop: K): T[K];
    set<K extends keyof T>(prop: K, val: T[K]): void;
    defaults(): T;
    on(eventName: string, callback: (...args: any[]) => void): this;
    toJSON(options?: any): any;
  }

  class Collection<TModel extends Model<ModelProperties>> {
    models: TModel[];
    length: number;

    add(model: {} | TModel): TModel;
    add(models: Array<{} | TModel>): TModel[];
    find(iterator: (item: TModel) => boolean, context?: any): TModel;
    remove(model: {} | TModel): TModel;
    remove(models: Array<{} | TModel>): TModel[];
    reset(models?: Array<{} | TModel>): TModel[];
    forEach(iterator: (item: TModel) => void, context?: any): TModel[];
    filter(iterator: (item: TModel) => boolean, context?: any): TModel[];
    map(iterator: (item: TModel) => any, context?: any): any[];
    each(callback: (item: TModel) => void);
  }

  interface GenericModel extends Model<{}> { }
}

declare namespace grapesjs {
  type PluginOptions = Record<string, any>;

  type Plugin<T extends PluginOptions = {}> = (editor: Editor, config: T) => void;

  interface EditorConfig {
    /** Selector which indicates where render the editor */
    container?: string | HTMLElement;

    /** If true, auto-render the content */
    autorender?: boolean;

    /** Array of plugins to execute on start */
    plugins?: (string | Plugin)[];

    /** Custom options for plugins */
    pluginsOpts?: Record<string, any>;

    /** Init headless editor */
    headless?: boolean;

    /** Style prefix */
    stylePrefix?: string;

    /** HTML string or object of components */
    components?: string;

    /** CSS string or object of rules */
    style?: string;

    /** If true, will fetch HTML and CSS from selected container */
    fromElement?: boolean;

    /** Show an alert before unload the page with unsaved changes */
    noticeOnUnload?: number;

    /** Show paddings and margins */
    showOffsets?: boolean;

    /** Show paddings and margins on selected component */
    showOffsetsSelected?: boolean;

    /** On creation of a new Component (via object), if the 'style' attribute is not
     * empty, all those roles will be moved in its new class */
    forceClass?: boolean;

    /** Height for the editor container */
    height?: string;

    /** Width for the editor container */
    width?: string;

    /** Type of logs to print with the logger (by default is used the devtool console).
     * Available by default: debug, info, warning, error
     * You can use `false` to disable all of them or `true` to print all of them */
    log?: ('debug' | 'info' | 'warning' | 'error')[];

    /** By default Grapes injects base CSS into the canvas. For example, it sets body margin to 0
     * and sets a default background color of white. This CSS is desired in most cases.
     * use this property if you wish to overwrite the base CSS to your own CSS. This is most
     * useful if for example your template is not based off a document with 0 as body margin.
     * @deprecated in favor of `config.canvas.frameStyle`
     */
    baseCss?: string;

    /** CSS that could only be seen (for instance, inside the code viewer) */
    protectedCss?: string;

    /** CSS for the iframe which containing the canvas, useful if you need to custom something inside
     * (eg. the style of the selected component) */
    canvasCss?: string;

    /** Default command */
    defaultCommand?: string;

    /** Show a toolbar when the component is selected */
    showToolbar?: boolean;

    // Allow script tag importing
    // @deprecated in favor of `config.parser.optionsHtml.allowScripts`
    // allowScripts: 0,

    /** If true render a select of available devices */
    showDevices?: boolean;

    /** When enabled, on device change media rules won't be created */
    devicePreviewMode?: boolean;

    /** The condition to use for media queries, eg. 'max-width'
     * Comes handy for mobile-first cases */
    mediaCondition?: string;

    /** Starting tag for variable inside scripts in Components */
    tagVarStart?: string;

    /** Ending tag for variable inside scripts in Components */
    tagVarEnd?: string;

    /** When false, removes empty text nodes when parsed, unless they contain a space */
    keepEmptyTextNodes?: boolean;

    /** Return JS of components inside HTML from 'editor.getHtml()' */
    jsInHtml?: boolean;

    /** Enable native HTML5 drag and drop */
    nativeDnD?: boolean;

    /** Enable multiple selection */
    multipleSelection?: boolean;

    /** Show the wrapper component in the final code, eg. in editor.getHtml() */
    exportWrapper?: boolean;

    /** The wrapper, if visible, will be shown as a `<body>` */
    wrapperIsBody?: boolean;

    /** Pass default available options wherever `editor.getHtml()` is called */
    optsHtml?: Record<string, any>;

    /** Pass default available options wherever `editor.getCss()` is called */
    optsCss?: Record<string, any>;

    /** Usually when you update the `style` of the component this changes the
     * element's `style` attribute. Unfortunately, inline styling doesn't allow
     * use of media queries (@media) or even pseudo selectors (eg. :hover).
     * When `avoidInlineStyle` is true all styles are inserted inside the css rule
     * @deprecated Don't use this option, we don't support inline styling anymore */
    avoidInlineStyle?: boolean;

    /** Avoid default properties from storable JSON data, like `components` and `styles`.
     * With this option enabled your data will be smaller (usefull if need to
     * save some storage space) */
    avoidDefaults?: boolean;

    /** (experimental)
     * The structure of components is always on the screen but it's not the same
     * for style rules. When you delete a component you might leave a lot of styles
     * which will never be used again, therefore they might be removed.
     * With this option set to true, styles not used from the CSS generator (so in
     * any case where `CssGenerator.build` is used) will be removed automatically.
     * But be careful, not always leaving the style not used mean you wouldn't
     * use it later, but this option comes really handy when deal with big templates. */
    clearStyles?: boolean;

    /** Specify the global drag mode of components. By default, components are moved
     * following the HTML flow. Two other options are available:
     * 'absolute' - Move components absolutely (design tools way)
     * 'translate' - Use translate CSS from transform property
     * To get more about this feature read: https://github.com/artf/grapesjs/issues/1936 */
    dragMode?: 'translate' | 'absolute';

    /** When the editor is placed in a scrollable container (eg. modals) this might
     * cause elements inside the canvas (eg. floating toolbars) to be misaligned.
     * To avoid that, you can specify an array of DOM elements on which their scroll will
     * trigger the canvas update.
     * Be default, if the array is empty, the first parent element will be appended.
     * listenToEl: [document.querySelector('#scrollable-el')], */
    listenToEl?: HTMLElement[];

    /** Import asynchronously CSS to use as icons */
    cssIcons?: string;

    /** Dom element */
    el?: string;

    /** Configurations for I18n */
    i18n?: Record<string, any>;

    /** Configurations for Undo Manager */
    undoManager?: Record<string, any> | boolean;

    /** Configurations for Asset Manager */
    assetManager?: AssetManagerConfig | boolean;

    /** Configurations for Canvas */
    canvas?: CanvasConfig | boolean;

    /** Configurations for Layers */
    layers?: Record<string, any> | boolean;

    /** Configurations for Storage Manager */
    storageManager?: StorageManagerConfig | boolean;

    /** Configurations for Rich Text Editor */
    richTextEditor?: RichTextEditorConfig | boolean;

    /** Configurations for DomComponents */
    domComponents?: DomComponentsConfig | boolean;

    /** Configurations for Modal Dialog */
    modal?: ModalConfig | boolean;

    /** Configurations for Code Manager */
    codeManager?: CodeManagerConfig | boolean;

    /** Configurations for Panels */
    panels?: PanelsConfig | boolean;

    /** Configurations for Commands */
    commands?: CommandsConfig | boolean;

    /** Configurations for Css Composer */
    cssComposer?: CssComposerConfig | boolean;

    /** Configurations for Selector Manager */
    selectorManager?: SelectorManagerConfig | boolean;

    /** Configurations for Device Manager */
    deviceManager?: DeviceManagerConfig | boolean;

    /** Configurations for Style Manager */
    styleManager?: StyleManagerConfig | boolean;

    /** Configurations for Block Manager */
    blockManager?: BlockManagerConfig | boolean;

    /** Configurations for Trait Manager */
    traitManager?: TraitManagerConfig | boolean;

    /** Configurations for Page Manager */
    pageManager?: PageManagerConfig;

    /** Texts **/
    textViewCode?: string;

    /** Keep unused styles within the editor **/
    keepUnusedStyles?: boolean;

    layerManager?: LayerManagerConfig;

    parser?: ParserConfig;
  }

  interface AssetManagerConfig {
    /**
     * Default assets.
     * @example
     * [
     *  'https://...image1.png',
     *  'https://...image2.png',
     *  {type: 'image', src: 'https://...image3.png', someOtherCustomProp: 1}
     * ]
     */
    assets?: (string | Record<string, any>)[];
    /**
     * Content to add where there is no assets to show.
     * @default ''
     * @example 'No <b>assets</b> here, drag to upload'
     */
    noAssets?: string;
    /**
     * Style prefix
     * @default 'am-'
     */
    stylePrefix?: string;
    /**
     * Upload endpoint, set `false` to disable upload.
     * @example 'https://endpoint/upload/assets'
     */
    upload?: false | string;
    /**
     * The name used in POST to pass uploaded files.
     * @default 'files'
     */
    uploadName?: string;
    /**
     * Custom headers to pass with the upload request.
     * @default {}
     */
    headers?: Record<string, any>;
    /**
     * Custom parameters to pass with the upload request, eg. csrf token.
     * @default {}
     */
    params?: Record<string, any>;
    /**
     * The credentials setting for the upload request, eg. 'include', 'omit'.
     * @default 'include'
     */
    credentials?: RequestCredentials;
    /**
     * Allow uploading multiple files per request. If disabled filename will not have '[]' appended.
     * @default true
     */
    multiUpload?: boolean;
    /**
     * If true, tries to add automatically uploaded assets. To make it work the server should respond with a JSON containing assets in a data key, eg:
     * { data: [ 'https://.../image.png', {src: 'https://.../image2.png'} ]
     * @default true
     */
    autoAdd?: boolean;
    /**
     * To upload your assets, the module uses Fetch API. With this option you can overwrite it with your own logic. The custom function should return a Promise.
     * @example
     * customFetch: (url, options) => axios(url, { data: options.body }),
     */
    customFetch?: (url: string, options: Record<string, any>) => Promise<void>;
    /**
     * Custom uploadFile function.
     * Differently from the `customFetch` option, this gives a total control over the uploading process, but you also have to emit all `asset:upload:*` events b
     * y yourself (if you need to use them somewhere).
     * @example
     * uploadFile: (ev) => {
     *  const files = ev.dataTransfer ? ev.dataTransfer.files : ev.target.files;
     *  // ...send somewhere
     * }
     */
    uploadFile?: (ev: DragEvent) => void;
    /**
     * In the absence of 'uploadFile' or 'upload' assets will be embedded as Base64.
     * @default true
     */
    embedAsBase64?: boolean;
    /**
     * Handle the image url submit from the built-in 'Add image' form.
     * @example
     * handleAdd: (textFromInput) => {
     *   // some check...
     *   editor.AssetManager.add(textFromInput);
     * }
     */
    handleAdd?: (value: string) => void;
    /**
     * Method called before upload, on return false upload is canceled.
     * @example
     * beforeUpload: (files) => {
     *  // logic...
     *  const stopUpload = true;
     *  if(stopUpload) return false;
     * }
     */
    beforeUpload?: (files: any) => void | false;
    /**
     * Toggles visiblity of assets url input
     * @default true
     */
    showUrlInput?: boolean;
    /**
     * Avoid rendering the default asset manager.
     * @default false
     */
    custom?:
      | boolean
      | {
          open?: (props: any) => void;
          close?: (props: any) => void;
        };
    /**
     * Enable an upload dropzone on the entire editor (not document) when dragging files over it.
     * If active the dropzone disable/hide the upload dropzone in asset modal, otherwise you will get double drops (#507).
     * @deprecated
     */
    dropzone?: boolean;
    /**
     * Open the asset manager once files are been dropped via the dropzone.
     * @deprecated
     */
    openAssetsOnDrop?: boolean;
    /**
     * Any dropzone content to append inside dropzone element
     * @deprecated
     */
    dropzoneContent?: string;
  }

  interface CanvasConfig {
    stylePrefix?: string;
    scripts?: Array<string>;
    styles?: Array<string>;
    customBadgeLabel?: Function;
    autoscrollLimit?: number;
    notTextable?: Array<string>;
    frameStyle?: string;
  }

  interface StyleManagerConfig {
    stylePrefix?: string;
    sectors?: Array<object>;
    appendTo?: HTMLElement | string;
    textNoElement?: string;
    hideNotStylable?: boolean;
    highlightChanged?: boolean;
    highlightComputed?: boolean;
    showComputed?: boolean;
    clearProperties?: boolean;
    avoidComputed?: Array<string>;
  }

  interface BlockManagerConfig {
    appendTo?: HTMLElement | string;
    blocks: Array<object>;
  }

  interface RichTextEditorConfig {
    stylePrefix?: string;
    adjustToolbar?: boolean;
    actions?: Array<string>;
  }

  interface TraitManagerConfig {
    stylePrefix?: string;
    appendTo?: HTMLElement | string;
    labelContainer?: string;
    labelPlhText?: string;
    labelPlhRef?: string;
    optionsTarget?: Array<object>;
    textNoElement?: string;
  }

  interface PageManagerConfig {
    pages?: any;
  }

  interface StorageManagerConfig {
    id?: string;
    autosave?: boolean;
    autoload?: boolean;
    type?: string;
    stepsBeforeSave?: number;
    recovery?: boolean | Function;
    onStore?: (data: any, editor: Editor) => any;
    onLoad?: (data: any, editor: Editor) => any;
    options?: {
      local?: LocalStorageConfig;
      remote?: RemoteStorageConfig;
      [key: string]: any;
    };
  }

  interface LocalStorageConfig {
    key?: string;
    checkLocal?: boolean;
  }

  interface RemoteStorageConfig {
    headers?: object;
    urlStore?: string;
    urlLoad?: string;
    contentTypeJson?: boolean;
    credentials?: RequestCredentials;
    fetchOptions?: string | ((opts: object) => object);
    onStore?: (data: any, editor: Editor) => any;
    onLoad?: (data: any, editor: Editor) => any;
  }

  interface DomComponentsConfig {
    stylePrefix?: string;
    wrapperId?: string;
    wrapperName?: string;
    wrapper?: DomComponentsWrapperConfig;
    components?: Array<object>;
    imageCompClass?: string;
    oAssetsOnCreate?: boolean;
    storeWrapper?: boolean;
    voidElements?: Array<string>;
  }

  interface DomComponentsWrapperConfig {
    removable?: boolean;
    copyable?: boolean;
    draggable?: boolean;
    // TODO: Type custom blocks and components
    components?: Array<object>;
    traits?: Array<object>;
    stylable?: Array<string>;
  }

  interface ModalConfig {
    stylePrefix?: string;
    title?: string;
    content?: string;
    backdrop?: boolean;
  }

  interface CodeManagerConfig {
    stylePrefix?: string;
    inlineCss?: boolean;
  }

  interface PanelsConfig {
    stylePrefix?: string;
    defaults?: Array<object>;
    em?: object;
    delayBtnsShow?: number;
  }

  interface CommandsConfig {
    ESCAPE_KEY?: number;
    stylePrefix?: string;
    defaults?: Array<object>;
    em?: object;
    firstCentered?: boolean;
    newFixedH?: boolean;
    minComponentH?: number;
    minComponentW?: number;
  }

  interface CssComposerConfig {
    stylePrefix?: string;
    staticRules?: string;
    rules?: Array<string>;
  }

  interface SelectorManagerConfig {
    stylePrefix?: string;
    appendTo?: HTMLElement | string;
    selectors?: Array<string>;
    label?: string;
    statesLabel?: string;
    selectedLabel?: string;
    states?: Array<object>;
    componentFirst?: boolean;
  }

  interface DeviceManagerConfig {
    devices?: Array<object>;
    deviceLabel?: string;
  }

  interface LayerManagerScrollLayersConfig {
    behavior?: string;
    block?: string;
  }

  interface LayerManagerScrollCanvasConfig {
    behavior?: string;
    block?: string;
  }

  interface LayerManagerConfig {
    /** Specify the element to use as a container, string (query) or HTMLElement
    * With the empty value, nothing will be rendered */
    appendTo?: HTMLElement | string;

    /** Scroll to selected component in Layers when it's selected in Canvas
    * true, false or `scrollIntoView`-like options */
    scrollLayers?: number | boolean | LayerManagerScrollLayersConfig;

    /** Style prefix */
    stylePrefix?: string;

    /** Enable/Disable globally the possibility to sort layers */
    sortable?: boolean;

    /** Enable/Disable globally the possibility to hide layers */
    hidable?: boolean;

    /** Hide textnodes */
    hideTextnode?: boolean;

    /** Indicate a query string of the element to be selected as the root of layers.
    * By default the root is the wrapper */
    root?: string;

    /** Indicates if the wrapper is visible in layers */
    showWrapper?: boolean;

    /** Show hovered components in canvas */
    showHover?: boolean;

    /** Scroll to selected component in Canvas when it's selected in Layers
    * true, false or `scrollIntoView`-like options,
    * `block: 'nearest'` avoids the issue of window scrolling */
    scrollCanvas?: boolean | LayerManagerScrollCanvasConfig;

    /** Highlight when a layer component is hovered */
    highlightHover?: boolean;

    /**
     * WARNING: Experimental option
     * A callback triggered once the component layer is initialized.
     * Useful to trigger updates on some component prop change.
     * @example
     * onInit({ component, render, listenTo }) {
     *  listenTo(component, 'change:some-prop', render);
     * };
     */
    onInit?: () => any;

    /**
     * WARNING: Experimental option
     * A callback triggered once the component layer is rendered.
     * A callback useful to update the layer DOM on some component change
     * @example
     * onRender({ component, el }) { // el is the DOM of the layer
     *  if (component.get('some-prop')) {
     *    // do changes using the `el` DOM
     *  }
     * }
     */
    onRender?: () => any;

    /**
     * Extend Layer view object (view/ItemView.js)
     * @example
     * extend: {
     *   setName(name) {
     *     // this.model is the component of the layer
     *     this.model.set('another-prop-for-name', name);
     *   },
     * },
     */
    extend?: any;
  }

  interface ParserConfig {
    optionsHtml?: object;
  }

  function init(config: EditorConfig): Editor;

  interface Trait extends Backbone.Model<TraitOptions> {
    target: Component;

    /** Return all the properties */
    props(): TraitOptions;
    targetUpdated(): void;
    getValue(): string;
    getTargetValue(): string;
    setTargetValue(value: any, opts: object): void;
    setValueFromInput(value: any, final: boolean, opts: object): void;
    /**
     * Get the initial value of the trait
     */
    getInitValue(): string;
  }

  type TraitType = 'text' | 'number' | 'checkbox' | 'select' | string;

  interface TraitOptions {
    type: TraitType;
    label: string;
    name: string;
    min?: string;
    max?: string;
    unit?: string;
    step?: number;
    value?: string;
    target?: Component;
    default?: string;
    placeholder?: string;
    changeProp?: number;
    options?: SelectOption[];
    command?: (editor: Editor) => void;
    [key: string]: any;
  }

  interface PanelOptions {
    id: string;
    content: string;
    visible: boolean;
    buttons: Button[];
  }

  interface Panel extends Backbone.Model<PanelOptions> { }

  interface Button extends Backbone.Model<ButtonOptions> { }

  interface ButtonOptions {
    id: string;
    label?: string;
    tagName?: 'span';
    className?: string;
    command?: string | ((editor: Editor, opts?: any) => void);
    context?: string;
    buttons?: any[];
    attributes?: { [key:string]: string};
    options?: object;
    active?: boolean;
    dragDrop?: boolean;
    togglable?: boolean;
    runDefaultCommand?: boolean;
    stopDefaultCommand?: boolean;
    disable?: boolean;
  }

  interface ComponentView {
    model: Component;

    onRender(opts: {
      editor?: Editor;
      model?: Component;
      el?: HTMLElement;
    }): void;
  }

  interface View { }

  interface LayerManager {
    /**
     * Set new root for layers
     * @param el Component to be set as the root
     */
    setRoot(el: HTMLElement | Component | String): this;
    /** Get the root of layers */
    getRoot(): Component;
    /** Return the view of layers */
    getAll(): View;
  }

  interface TraitView {
    noLabel?: boolean;
    templateInput?: string | ((options: { trait: Trait }) => string);
    eventCapture?: string[];

    onEvent?: (options: {
      elInput: HTMLElement;
      component: Component;
      event: any;
    }) => void;
    onUpdate?: (options: {
      elInput: HTMLElement;
      component: Component;
    }) => void;
    createInput?: (options: { trait: Trait }) => HTMLElement;
    createLabel?: (options: { label: string }) => string;
  }

  interface TraitManager {
    /**
     * Add new trait type
     * @param name Type name
     * @param methods Object representing the trait
     */
    addType(name: string, trait: TraitView): void;
    /**
     * Get trait type
     * @param name Type name
     */
    getType(name: string): Object;
    /**
     * Get all trait types
     */
    getTypes(): Object;
  }

  /**
   * Editor contains the top level API which you'll probably use to customize the editor or extend it with plugins.
   * You get the Editor instance on init method and you can pass options via its [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/editor/config/config.js)
   *
   * ```js
   * const editor = grapesjs.init({
   *    // options
   * });
   * ```
   *
   * ## Available Events
   *
   * You can make use of available events in this way
   * ```js
   * editor.on('EVENT-NAME', (some, argument) => {
   *    // do something
   * })
   * ```
   *
   * * `update` - The structure of the template is updated (its HTML/CSS)
   * * `undo` - Undo executed
   * * `redo` - Redo executed
   * * `load` - Editor is loaded
   *
   * ### Components
   * Check the [Components](/api/components.html) module.
   * ### Keymaps
   * Check the [Keymaps](/api/keymaps.html) module.
   * ### Style Manager
   * Check the [Style Manager](/api/style_manager.html) module.
   * ### Storage
   * Check the [Storage](/api/storage_manager.html) module.
   * ### Canvas
   * Check the [Canvas](/api/canvas.html) module.
   * ### RTE
   * Check the [Rich Text Editor](/api/rich_text_editor.html) module.
   * ### Commands
   * Check the [Commands](/api/commands.html) module.
   * ### Selectors
   * Check the [Selectors](/api/selector_manager.html) module.
   * ### Blocks
   * Check the [Blocks](/api/block_manager.html) module.
   * ### Assets
   * Check the [Assets](/api/assets.html) module.
   * ### Modal
   * Check the [Modal](/api/modal_dialog.html) module.
   * ### Devices
   * Check the [Devices](/api/device_manager.html) module.
   * ### Parser
   * Check the [Parser](/api/parser.html) module.
   * ### Pages
   * Check the [Pages](/api/pages.html) module.
   *
   * ## Methods
   */
  interface Editor {
    Components: Components;
    DomComponents: Components;
    Layers: LayerManager;
    LayerManager: LayerManager;
    Css: CssComposer;
    CssComposer: CssComposer;
    Storage: StorageManager;
    StorageManager: StorageManager;
    Assets: AssetManager;
    AssetManager: AssetManager;
    Blocks: BlockManager;
    BlockManager: BlockManager;
    Traits: TraitManager;
    TraitManager: TraitManager;
    Selectors: SelectorManager;
    SelectorManager: SelectorManager;
    Pages: Pages;
    PageManager: Pages;
    CodeManager: object;
    Commands: Commands;
    Keymaps: Keymaps;
    Modal: Modal;
    Panels: Panels;
    Styles: StyleManager;
    StyleManager: StyleManager;
    Canvas: Canvas;
    UndoManager: UndoManager;
    Devices: Devices;
    DeviceManager: Devices;
    RichTextEditor: RichTextEditor;
    I18n: I18n;
    Parser: Parser;
    Utils: object;
    Config: EditorConfig | object;

    /**
     * Returns configuration object
     * @param [prop] - Property name
     * @returns Returns the configuration object or
     *  the value of the specified property
     */
    getConfig(prop?: string): EditorConfig;
    /**
     * Returns HTML built inside canvas
     * @param [opts = {}] - Options
     * @param [opts.component] - Return the HTML of a specific Component
     * @param [opts.cleanId = false] - Remove unnecessary IDs (eg. those created automatically)
     * @returns HTML string
     */
    getHtml(opts?: { component?: Component; cleanId?: boolean }): string;
    /**
     * Returns CSS built inside canvas
     * @param [opts = {}] - Options
     * @param [opts.component] - Return the CSS of a specific Component
     * @param [opts.json = false] - Return an array of CssRules instead of the CSS string
     * @param [opts.avoidProtected = false] - Don't include protected CSS
     * @param [opts.onlyMatched = false] - Return only rules matched by the passed component.
     * @returns CSS string or array of CssRules
     */
    getCss(opts?: {
      component?: Component;
      json?: boolean;
      avoidProtected?: boolean;
      onlyMatched?: boolean;
    }): string | CssRule[];
    /**
     * Returns JS of all components
     * @param [opts = {}] - Options
     * @param [opts.component] - Get the JS of a specific component
     * @returns JS string
     */
    getJs(opts?: { component?: Component }): string;
    /**
     * Return the complete tree of components. Use `getWrapper` to include also the wrapper
     */
    getComponents(): Components;
    /**
     * Return the wrapper and its all components
     */
    getWrapper(): Component;
    /**
     * Set components inside editor's canvas. This method overrides actual components
     * @example
     * editor.setComponents('<div class="cls">New component</div>');
     * // or
     * editor.setComponents({
     *  type: 'text',
     *   classes:['cls'],
     *   content: 'New component'
     * });
     * @param components - HTML string or components model
     * @param opt - the options object to be used by the [setComponents]{@link em#setComponents} method
     */
    setComponents(components: object[] | any | string, opt?: any): any;
    /**
     * Add components
     * @example
     * editor.addComponents('<div class="cls">New component</div>');
     * // or
     * editor.addComponents({
     *  type: 'text',
     *   classes:['cls'],
     *   content: 'New component'
     * });
     * @param components - HTML string or components model
     * @param opts - Options
     * @param [opts.avoidUpdateStyle = false] - If the HTML string contains styles,
     * by default, they will be created and, if already exist, updated. When this option
     * is true, styles already created will not be updated.
     * @param [opts.at] - If provided, an index to insert these components at.
     */
    addComponents(
      components: object[] | any | string,
      opts?: {
        avoidUpdateStyle?: boolean;
        at?: number;
      }
    ): Component[];
    /**
     * Returns style in JSON format object
     */
    getStyle(): any;
    /**
     * Set style inside editor's canvas. This method overrides actual style
     * @example
     * editor.setStyle('.cls{color: red}');
     * //or
     * editor.setStyle({
     *   selectors: ['cls'],
     *   style: { color: 'red' }
     * });
     * @param style - CSS string or style model
     */
    setStyle(style: object[] | any | string): Editor;
    /**
     * Add styles to the editor
     * @example
     * editor.addStyle('.cls{color: red}');
     * @param style - CSS string or style model
     * @returns Array of created CssRule instances
     */
    addStyle(style: object[] | any | string): CssRule[];
    /**
     * Returns the last selected component, if there is one
     */
    getSelected(): Component | null;
    /**
     * Returns an array of all selected components
     */
    getSelectedAll(): Component[];
    /**
     * Get a stylable entity from the selected component.
     * If you select a component without classes the entity is the Component
     * itself and all changes will go inside its 'style' attribute. Otherwise,
     * if the selected component has one or more classes, the function will
     * return the corresponding CSS Rule
     */
    getSelectedToStyle(): Component; // TODO: | CSSRule
    /**
     * Select a component
     * @example
     * // Select dropped block
     * editor.on('block:drag:stop', function(model) {
     *  editor.select(model);
     * });
     * @param el - Component to select
     * @param [opts] - Options
     * @param [opts.scroll] - Scroll canvas to the selected element
     */
    select(
      el?: Component | HTMLElement,
      opts?: {
        scroll?: boolean;
      }
    ): Editor;
    /**
     * Add component to selection
     * @example
     * editor.selectAdd(model);
     * @param el - Component to select
     */
    selectAdd(el: Component | HTMLElement | any[]): Editor;
    /**
     * Remove component from selection
     * @example
     * editor.selectRemove(model);
     * @param el - Component to select
     */
    selectRemove(el: Component | HTMLElement | any[]): Editor;
    /**
     * Toggle component selection
     * @example
     * editor.selectToggle(model);
     * @param el - Component to select
     */
    selectToggle(el: Component | HTMLElement | any[]): Editor;
    /**
     * Returns, if active, the Component enabled in rich text editing mode.
     * @example
     * const textComp = editor.getEditing();
     * if (textComp) {
     *  console.log('HTML: ', textComp.toHTML());
     * }
     */
    getEditing(): Component | null;
    /**
     * Set device to the editor. If the device exists it will
     * change the canvas to the proper width
     * @example
     * editor.setDevice('Tablet');
     * @param name - Name of the device
     */
    setDevice(name: string): Editor;
    /**
     * Return the actual active device
     * @example
     * var device = editor.getDevice();
     * console.log(device);
     * // 'Tablet'
     * @returns Device name
     */
    getDevice(): string;
    /**
     * Execute command
     * @example
     * editor.runCommand('myCommand', {someValue: 1});
     * @param id - Command ID
     * @param options - Custom options
     * @returns The return is defined by the command
     */
    runCommand(id: string, options?: Record<string, unknown>): any;
    /**
     * Stop the command if stop method was provided
     * @example
     * editor.stopCommand('myCommand', {someValue: 1});
     * @param id - Command ID
     * @param options - Custom options
     * @returns The return is defined by the command
     */
    stopCommand(id: string, options?: Record<string, unknown>): any;
    /**
     * Store data to the current storage
     * @param options - Storage options
     * @returns Stored data
     * @example
     * const storedData = await editor.store();
     */
    store(options: StorageOptions): Promise<any>;
    /**
     * Load data from the current storage
     * @param options - Storage options
     * @returns Loaded data
     * @example
     * const data = await editor.load();
     */
    load(options: StorageOptions): Promise<any>;
    /**
     * Get the JSON project data, which could be stored and loaded back with `editor.loadProjectData(json)`
     * @returns {Object}
     * @example
     * console.log(editor.getProjectData());
     * // { pages: [...], styles: [...], ... }
     */
    getProjectData(): any;
    /**
     * Load data from the JSON project
     * @param {Object} data Project to load
     * @example
     * editor.loadProjectData({ pages: [...], styles: [...], ... })
     */
    loadProjectData(data: any): any;
    /**
     * Returns container element. The one which was indicated as 'container'
     * on init method
     */
    getContainer(): HTMLElement;
    /**
     * Return the count of changes made to the content and not yet stored.
     * This count resets at any `store()`
     */
    getDirtyCount(): number;
    /**
     * Update editor dimension offsets
     *
     * This method could be useful when you update, for example, some position
     * of the editor element (eg. canvas, panels, etc.) with CSS, where without
     * refresh you'll get misleading position of tools
     * @param [options] - Options
     * @param [options.tools = false] - Update the position of tools (eg. rich text editor, component highlighter, etc.)
     */
    refresh(options?: { tools?: boolean }): void;
    /**
     * Replace the built-in Rich Text Editor with a custom one.
     * @example
     * editor.setCustomRte({
     *   // Function for enabling custom RTE
     *   // el is the HTMLElement of the double clicked Text Component
     *   // rte is the same instance you have returned the first time you call
     *   // enable(). This is useful if need to check if the RTE is already enabled so
     *   // ion this case you'll need to return the RTE and the end of the function
     *   enable: function(el, rte) {
     *     rte = new MyCustomRte(el, {}); // this depends on the Custom RTE API
     *     ...
     *     return rte; // return the RTE instance
     *   },
     *
     *   // Disable the editor, called for example when you unfocus the Text Component
     *  disable: function(el, rte) {
     *     rte.blur(); // this depends on the Custom RTE API
     *  }
     *
     * // Called when the Text Component is focused again. If you returned the RTE instance
     * // from the enable function, the enable won't be called again instead will call focus,
     * // in this case to avoid double binding of the editor
     *  focus: function (el, rte) {
     *   rte.focus(); // this depends on the Custom RTE API
     *  }
     * });
     * @param obj - Custom RTE Interface
     */
    setCustomRte(obj: any): void;
    /**
     * Replace the default CSS parser with a custom one.
     * The parser function receives a CSS string as a parameter and expects
     * an array of CSSRule objects as a result. If you need to remove the
     * custom parser, pass `null` as the argument
     * @example
     * editor.setCustomParserCss(css => {
     *  const result = [];
     *  // ... parse the CSS string
     *  result.push({
     *    selectors: '.someclass, div .otherclass',
     *    style: { color: 'red' }
     *  })
     *  // ...
     *  return result;
     * });
     * @param parser - Parser function
     */
    setCustomParserCss(parser: ((...params: any[]) => any) | null): Editor;
    /**
     * Change the global drag mode of components.
     * To get more about this feature read: https://github.com/artf/grapesjs/issues/1936
     * @param value - Drag mode, options: 'absolute' | 'translate'
     */
    setDragMode(value: string): Editor;
    /**
     * Trigger event log message
     * @example
     * editor.log('Something done!', { ns: 'from-plugin-x', level: 'info' });
     * // This will trigger following events
     * // `log`, `log:info`, `log-from-plugin-x`, `log-from-plugin-x:info`
     * // Callbacks of those events will always receive the message and
     * // options, as arguments, eg:
     * // editor.on('log:info', (msg, opts) => console.info(msg, opts))
     * @param msg - Message to log
     * @param [opts = {}] - Custom options
     * @param [opts.ns = ''] - Namespace of the log (eg. to use in plugins)
     * @param [opts.level = 'debug'] - Level of the log, `debug`, `info`, `warning`, `error`
     */
    log(
      msg: any,
      opts?: {
        ns?: string;
        level?: string;
      }
    ): Editor;
    /**
     * Translate label
     * @example
     * editor.t('msg');
     * // use params
     * editor.t('msg2', { params: { test: 'hello' } });
     * // custom local
     * editor.t('msg2', { params: { test: 'hello' }, l: 'it' });
     * @param key - Label to translate
     * @param [opts] - Options for the translation
     * @param [opts.params] - Params for the translation
     * @param [opts.noWarn] - Avoid warnings in case of missing resources
     */
    t(
      key: string,
      opts?: {
        params?: any;
        noWarn?: boolean;
      }
    ): string;
    /**
     * Attach event
     * @param event - Event name
     * @param callback - Callback function
     */
    on(event: GrapesEvent, callback: (...params: any[]) => any): Editor;
    /**
     * Attach event and detach it after the first run
     * @param event - Event name
     * @param callback - Callback function
     */
    once(event: GrapesEvent, callback: (...params: any[]) => any): Editor;
    /**
     * Detach event
     * @param event - Event name
     * @param callback - Callback function
     */
    off(event: GrapesEvent, callback: (...params: any[]) => any): Editor;
    /**
     * Trigger event
     * @param event - Event to trigger
     */
    trigger(event: GrapesEvent): Editor;
    /**
     * Destroy the editor
     */
    destroy(): void;
    /**
     * Render editor
     */
    render(): HTMLElement;
    /**
     * Trigger a callback once the editor is loaded and rendered.
     * The callback will be executed immediately if the method is called on the already rendered editor.
     * @example
     * editor.onReady(() => {
     *   // perform actions
     * });
     * @param clb - Callback to trigger
     */
    onReady(clb: (...params: any[]) => any): void;
    /**
     * Print safe HTML by using ES6 tagged template strings.
     * @example
     * const unsafeStr = '<script>....</script>';
     * const safeStr = '<b>Hello</b>';
     * // Use `$${var}` to avoid escaping
     * const strHtml = editor.html`Escaped ${unsafeStr}, unescaped $${safeStr}`;
     */
    html(literals: string[], substs: string[]): string;

    getModel(): Backbone.Model<any>;
  }

  type GrapesEvent =
    | ComponentEvent
    | BlockEvent
    | AssetEvent
    | KeymapEvent
    | StyleManagerEvent
    | StorageEvent
    | CanvasEvent
    | SelectorEvent
    | RichTextEditorEvent
    | ModalEvent
    | CommandEvent
    | GeneralEvent;

  type ComponentEvent =
    | 'component:create'
    | 'component:mount'
    | 'component:add'
    | 'component:remove'
    | 'component:remove:before'
    | 'component:clone'
    | 'component:update'
    | 'component:styleUpdate'
    | 'component:selected'
    | 'component:deselected'
    | 'component:toggled'
    | 'component:type:add'
    | 'component:type:update'
    | 'component:drag:start'
    | 'component:drag'
    | 'component:drag:end';

  type BlockEvent =
    | 'block:add'
    | 'block:remove'
    | 'block:drag:start'
    | 'block:drag'
    | 'block:drag:stop';

  type AssetEvent =
    | 'asset:add'
    | 'asset:remove'
    | 'asset:upload:start'
    | 'asset:upload:end'
    | 'asset:upload:error'
    | 'asset:upload:response';

  type KeymapEvent =
    | 'keymap:add'
    | 'keymap:remove'
    | 'keymap:emit'
    | 'keymap:emit:{keymapId}';

  type StyleManagerEvent =
    | 'styleManager:update:target'
    | 'styleManager:change'
    | 'styleManager:change:{propertyName}';

  type StorageEvent =
    | 'storage:start'
    | 'storage:start:store'
    | 'storage:start:load'
    | 'storage:load'
    | 'storage:store'
    | 'storage:end'
    | 'storage:end:store'
    | 'storage:end:load'
    | 'storage:error'
    | 'storage:error:store'
    | 'storage:error:load';

  type CanvasEvent =
    | 'canvas:dragenter'
    | 'canvas:dragover'
    | 'canvas:drop'
    | 'canvas:dragend'
    | 'canvas:dragdata';

  type SelectorEvent = 'selector:add';

  type RichTextEditorEvent = 'rte:enable' | 'rte:disable';

  type ModalEvent = 'modal:open' | 'modal:close';

  type CommandEvent =
    | `run:${string}`
    | `stop:${string}`
    | `abort:${string}`;

  type GeneralEvent = 'canvasScroll' | 'undo' | 'redo' | 'load' | 'update';

  /**
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/asset_manager/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  assetManager: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
   *
   * ```js
   * const assetManager = editor.AssetManager;
   * ```
   *
   * ## Available Events
   * * `asset:open` - Asset Manager opened.
   * * `asset:close` - Asset Manager closed.
   * * `asset:add` - Asset added. The [Asset] is passed as an argument to the callback.
   * * `asset:remove` - Asset removed. The [Asset] is passed as an argument to the callback.
   * * `asset:update` - Asset updated. The updated [Asset] and the object containing changes are passed as arguments to the callback.
   * * `asset:upload:start` - Before the upload is started.
   * * `asset:upload:end` - After the upload is ended.
   * * `asset:upload:error` - On any error in upload, passes the error as an argument.
   * * `asset:upload:response` - On upload response, passes the result as an argument.
   * * `asset` - Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
   * * `asset:custom` - Event for handling custom Asset Manager UI.
   *
   * ## Methods
   * * [open](#open)
   * * [close](#close)
   * * [isOpen](#isopen)
   * * [add](#add)
   * * [get](#get)
   * * [getAll](#getall)
   * * [getAllVisible](#getallvisible)
   * * [remove](#remove)
   * * [store](#store)
   * * [load](#load)
   * * [getContainer](#getcontainer)
   *
   * [Asset]: asset.html
   */
  interface AssetManager {
    /**
     * Open the asset manager.
     * @example
     * assetManager.open({
     *  select(asset, complete) {
     *    const selected = editor.getSelected();
     *    if (selected && selected.is('image')) {
     *      selected.addAttributes({ src: asset.getSrc() });
     *      // The default AssetManager UI will trigger `select(asset, false)` on asset click
     *      // and `select(asset, true)` on double-click
     *      complete && assetManager.close();
     *    }
     *  }
     * });
     * // with your custom types (you should have assets with those types declared)
     * assetManager.open({ types: ['doc'], ... });
     * @param [options] - Options for the asset manager.
     * @param [options.types = ['image']] - Types of assets to show.
     * @param [options.select] - Type of operation to perform on asset selection. If not specified, nothing will happen.
     */
    open(options?: {
      types?: String[];
      select?: (...params: any[]) => any;
    }): void;
    /**
     * Close the asset manager.
     * @example
     * assetManager.close();
     */
    close(): void;
    /**
     * Checks if the asset manager is open
     * @example
     * assetManager.isOpen(); // true | false
     */
    isOpen(): boolean;
    /**
     * Add new asset/s to the collection. URLs are supposed to be unique
     * @example
     * // As strings
     * assetManager.add('http://img.jpg');
     * assetManager.add(['http://img.jpg', './path/to/img.png']);
     *
     * // Using objects you can indicate the type and other meta informations
     * assetManager.add({
     *  // type: 'image',	// image is default
     * 	src: 'http://img.jpg',
     * 	height: 300,
     * 	width: 200,
     * });
     * assetManager.add([{ src: 'img2.jpg' }, { src: 'img2.png' }]);
     * @param asset - URL strings or an objects representing the resource.
     * @param [opts] - Options
     */
    add(asset: string | any | String[] | object[], opts?: any): any;
    /**
     * Return asset by URL
     * @example
     * const asset = assetManager.get('http://img.jpg');
     * @param src - URL of the asset
     */
    get(src: string): any;
    /**
     * Return the global collection, containing all the assets
     */
    getAll(): any;
    /**
     * Return the visible collection, which contains assets actually rendered
     */
    getAllVisible(): any;
    /**
     * Remove asset
     * @example
     * const removed = assetManager.remove('http://img.jpg');
     * // or by passing the Asset
     * const asset = assetManager.get('http://img.jpg');
     * assetManager.remove(asset);
     */
    remove(asset: any, opts?: Record<string, any>): any;
    /**
     * Store assets data to the selected storage
     * @example
     * var assets = assetManager.store();
     * @param noStore - If true, won't store
     * @returns Data to store
     */
    store(noStore: boolean): any;
    /**
     * Load data from the passed object.
     * The fetched data will be added to the collection.
     * @example
     * var assets = assetManager.load({
     * 	assets: [...]
     * })
     * @param data - Object of data to load
     * @returns Loaded assets
     */
    load(data: any): any;
    /**
     * Return the Asset Manager Container
     */
    getContainer(): HTMLElement;
    /**
     * Render assets
     * @example
     * // Render all assets
     * assetManager.render();
     *
     * // Render some of the assets
     * const assets = assetManager.getAll();
     * assetManager.render(assets.filter(
     *  asset => asset.get('category') == 'cats'
     * ));
     * @param assets - Assets to render, without the argument will render all global assets
     */
    render(assets: any[]): HTMLElement;
  }

  interface AssetOptions {
    /**
     * Asset type, eg. 'image'.
     */
    type: string;
    /**
     * Asset URL, eg. 'https://.../image.png'.
     */
    src: string;
  }

  interface Asset extends Backbone.Model<AssetOptions> {
    /**
     * Get asset type.
     * @example
     * // Asset: { src: 'https://.../image.png', type: 'image' }
     * asset.getType(); // -> 'image'
     */
    getType(): string;

    /**
     * Get asset URL.
     * @example
     * // Asset: { src: 'https://.../image.png'  }
     * asset.getSrc(); // -> 'https://.../image.png'
     */
    getSrc(): string;

    /**
     * Get filename of the asset (based on `src`).
     * @example
     * // Asset: { src: 'https://.../image.png' }
     * asset.getFilename(); // -> 'image.png'
     * // Asset: { src: 'https://.../image' }
     * asset.getFilename(); // -> 'image'
     */
    getFilename(): string;

    /**
     * Get extension of the asset (based on `src`).
     * @example
     * // Asset: { src: 'https://.../image.png' }
     * asset.getExtension(); // -> 'png'
     * // Asset: { src: 'https://.../image' }
     * asset.getExtension(); // -> ''
     */
    getExtension(): string;
  }

  /**
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/block_manager/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  blockManager: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
   *
   * ```js
   * // Listen to events
   * editor.on('block:add', (block) => { ... });
   *
   * // Use the API
   * const blockManager = editor.BlockManager;
   * blockManager.add(...);
   * ```
   *
   * ## Available Events
   * * `block:add` - Block added. The [Block] is passed as an argument to the callback.
   * * `block:remove` - Block removed. The [Block] is passed as an argument to the callback.
   * * `block:update` - Block updated. The [Block] and the object containing changes are passed as arguments to the callback.
   * * `block:drag:start` - Started dragging block, the [Block] is passed as an argument.
   * * `block:drag` - Dragging block, the [Block] is passed as an argument.
   * * `block:drag:stop` - Dragging of the block is stopped. The dropped [Component] (if dropped successfully) and the [Block] are passed as arguments.
   * * `block` - Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
   *
   * ## Methods
   * * [add](#add)
   * * [get](#get)
   * * [getAll](#getall)
   * * [getAllVisible](#getallvisible)
   * * [remove](#remove)
   * * [getConfig](#getconfig)
   * * [getCategories](#getcategories)
   * * [getContainer](#getcontainer)
   * * [render](#render)
   *
   * [Block]: block.html
   * [Component]: component.html
   */
  interface BlockManager {
    /**
     * Get configuration object
     */
    getConfig(): BlockManagerConfig;
    /**
     * Add new block.
     * @example
     * blockManager.add('h1-block', {
     *   label: 'Heading',
     *   content: '<h1>Put your title here</h1>',
     *   category: 'Basic',
     *   attributes: {
     *     title: 'Insert h1 block'
     *   }
     * });
     * @param id - Block ID
     */
    add(id: string, block: BlockOptions, opts?: Record<string, any>): any;
    /**
     * Get the block by id.
     * @example
     * const block = blockManager.get('h1-block');
     * console.log(JSON.stringify(block));
     * // {label: 'Heading', content: '<h1>Put your ...', ...}
     * @param id - Block id
     */
    get(id: string): any;
    /**
     * Return all blocks.
     * @example
     * const blocks = blockManager.getAll();
     * console.log(JSON.stringify(blocks));
     * // [{label: 'Heading', content: '<h1>Put your ...'}, ...]
     */
    getAll(): any;
    /**
     * Return the visible collection, which containes blocks actually rendered
     */
    getAllVisible(): any;
    /**
     * Remove block.
     * @example
     * const removed = blockManager.remove('BLOCK_ID');
     * // or by passing the Block
     * const block = blockManager.get('BLOCK_ID');
     * blockManager.remove(block);
     */
    remove(block: object | string, opts?: Record<string, any>): any;
    /**
     * Get all available categories.
     * It's possible to add categories only within blocks via 'add()' method
     */
    getCategories(): Backbone.Collection<Backbone.Model<any>>;
    /**
     * Return the Blocks container element
     */
    getContainer(): HTMLElement;
    /**
     * Render blocks
     * @example
     * // Render all blocks (inside the global collection)
     * blockManager.render();
     *
     * // Render new set of blocks
     * const blocks = blockManager.getAll();
     * const filtered = blocks.filter(block => block.get('category') == 'sections')
     *
     * blockManager.render(filtered);
     * // Or a new set from an array
     * blockManager.render([
     *  {label: 'Label text', content: '<div>Content</div>'}
     * ]);
     *
     * // Back to blocks from the global collection
     * blockManager.render();
     *
     * // You can also render your blocks outside of the main block container
     * const newBlocksEl = blockManager.render(filtered, { external: true });
     * document.getElementById('some-id').appendChild(newBlocksEl);
     * @param blocks - Blocks to render, without the argument will render all global blocks
     * @param [opts = {}] - Options
     * @param [opts.external] - Render blocks in a new container (HTMLElement will be returned)
     * @param [opts.ignoreCategories] - Render blocks without categories
     * @returns Rendered element
     */
    render(
      blocks: any[],
      opts?: {
        external?: boolean;
        ignoreCategories?: boolean;
      }
    ): HTMLElement;
  }

  interface BlockCategoryOptions {
    id: string,
    label: string,
    open?: boolean,
    attributes?: Record<string, any>,
  }

  interface BlockOptions {
    /**
     * Block label, eg. `My block`
     */
    label: string;
    /**
     * The content of the block. Might be an HTML string or a [Component Defintion](/modules/Components.html#component-definition)
     */
    content: string | any;
    /**
     * HTML string for the media/icon of the block, eg. `<svg ...`, `<img ...`, etc.
     * @defaultValue ''
     */
    media?: string;
    /**
     * Block category, eg. `Basic blocks`
     * @defaultValue ''
     */
    category?: string | BlockCategoryOptions;
    /**
     * If true, triggers the `active` event on the dropped component.
     */
    activate?: boolean;
    /**
     * If true, the dropped component will be selected.
     */
    select?: boolean;
    /**
     * If true, all IDs of dropped components and their styles will be changed.
     */
    resetId?: boolean;
    /**
     * Disable the block from being interacted
     */
    disable?: boolean;
    /**
     * Custom behavior on click, eg. `(block, editor) => editor.getWrapper().append(block.get('content'))`
     */
    onClick?: (...params: any[]) => any;
    /**
     * Block attributes
     */
    attributes?: Record<string, any>;
  }
  interface Block extends Backbone.Model<BlockOptions> {
    /**
     * Get block id
     */
    getId(): string;

    /**
     * Get block label
     */
    getLabel(): string;

    /**
     * Get block media
     */
    getMedia(): string;

    /**
     * Get block content
     * @returns Component definition | HTML string
     */
    getContent(): any | string | (object | String)[];

    /**
     * Get block category label
     */
    getCategoryLabel(): string;

    self(): Block;
  }

  interface Command {
    run: (editor: Editor, sender?: any, opts?: Record<string, any>) => any;
    stop?: (editor: Editor, sender?: any, opts?: Record<string, any>) => any;
    [key: string]: unknown;
  }

  /**
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/commands/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  commands: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
   *
   * ```js
   * // Listen to events
   * editor.on('run', () => { ... });
   *
   * // Use the API
   * const commands = editor.Commands;
   * commands.add(...);
   * ```
   *
   * * ## Available Events
   * * `run:{commandName}` - Triggered when some command is called to run (eg. editor.runCommand('preview'))
   * * `stop:{commandName}` - Triggered when some command is called to stop (eg. editor.stopCommand('preview'))
   * * `run:{commandName}:before` - Triggered before the command is called
   * * `stop:{commandName}:before` - Triggered before the command is called to stop
   * * `abort:{commandName}` - Triggered when the command execution is aborted (`editor.on(`run:preview:before`, opts => opts.abort = 1);`)
   * * `run` - Triggered on run of any command. The id and the result are passed as arguments to the callback
   * * `stop` - Triggered on stop of any command. The id and the result are passed as arguments to the callback
   *
   * ## Methods
   * * [add](#add)
   * * [get](#get)
   * * [getAll](#getall)
   * * [extend](#extend)
   * * [has](#has)
   * * [run](#run)
   * * [stop](#stop)
   * * [isActive](#isactive)
   * * [getActive](#getactive)
   */
  interface Commands {
    /**
     * Add new command to the collection
     * @example
     * commands.add('myCommand', {
     * 	run(editor, sender) {
     * 		alert('Hello world!');
     * 	},
     * 	stop(editor, sender) {
     * 	},
     * });
     * // As a function
     * commands.add('myCommand2', editor => { ... });
     */
     add<F, S>(
      id: string,
      command: Command['run'] | (Command & S & ThisType<Command & S>),
    ): void;
    /**
     * Get command by ID
     * @example
     * var myCommand = commands.get('myCommand');
     * myCommand.run();
     * @param id - Command's ID
     * @returns Object representing the command
     */
    get(id: string): any;
    /**
     * Extend the command. The command to extend should be defined as an object
     * @example
     * commands.extend('old-command', {
     *  someInnerFunction() {
     *  // ...
     *  }
     * });
     * @param id - Command's ID
     * @param Object - with the new command functions
     */
    extend(id: string, Object: any): Commands;
    /**
     * Check if command exists
     * @param id - Command's ID
     */
    has(id: string): boolean;
    /**
     * Get an object containing all the commands
     */
    getAll(): any;
    /**
     * Execute the command
     * @example
     * commands.run('myCommand', { someOption: 1 });
     * @param id - Command ID
     * @param [options = {}] - Options
     * @returns The return is defined by the command
     */
    run(id: string, options?: any): any;
    /**
     * Stop the command
     * @example
     * commands.stop('myCommand', { someOption: 1 });
     * @param id - Command ID
     * @param [options = {}] - Options
     * @returns The return is defined by the command
     */
    stop(id: string, options?: any): any;
    /**
     * Check if the command is active. You activate commands with `run`
     * and disable them with `stop`. If the command was created without `stop`
     * method it can't be registered as active
     * @example
     * const cId = 'some-command';
     * commands.run(cId);
     * commands.isActive(cId);
     * // -> true
     * commands.stop(cId);
     * commands.isActive(cId);
     * // -> false
     * @param id - Command id
     */
    isActive(id: string): boolean;
    /**
     * Get all active commands
     * @example
     * console.log(commands.getActive());
     * // -> { someCommand: itsLastReturn, anotherOne: ... };
     */
    getActive(): any;
  }

  interface AddComponentOptions {
    isComponent?: (el: HTMLElement) => boolean | ComponentDefinition;
    model?: ThisType<ComponentModelDefinition & Component>;
    view?: ThisType<ComponentViewDefinition & ComponentView>;
    extend?: string,
    extendView?: string,
    extendFn?: string[],
    extendFnView?: string[],
  }

  interface ComponentModelDefinition {
    defaults?: ComponentDefinition;
    init?: (this: Component) => void;
    handlePropChange?: (this: Component) => void;
    handleAttrChange?: (this: Component) => void;
    handleTitleChange?: (this: Component) => void;
    [key: string]: any;
  }

  interface ComponentViewDefinition {
    tagName?: string;
    events?: Record<string, string>;
    init?: (options: { model: Component }) => void;
    removed?: () => void;
    onRender?: (options: { el: HTMLElement; model: Component }) => void;
    [key: string]: any;
  }

  /**
   * With this module is possible to manage components inside the canvas. You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/dom_components/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  domComponents: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
   *
   * ```js
   * // Listen to events
   * editor.on('component:create', () => { ... });
   *
   * // Use the API
   * const cmp = editor.Components;
   * cmp.addType(...);
   * ```
   *
   * ## Available Events
   * * `component:create` - Component is created (only the model, is not yet mounted in the canvas), called after the init() method
   * * `component:mount` - Component is mounted to an element and rendered in canvas
   * * `component:add` - Triggered when a new component is added to the editor, the model is passed as an argument to the callback
   * * `component:remove` - Triggered when a component is removed, the model is passed as an argument to the callback
   * * `component:remove:before` - Triggered before the remove of the component, the model, remove function (if aborted via options, with this function you can complete the remove) and options (use options.abort = true to prevent remove), are passed as arguments to the callback
   * * `component:clone` - Triggered when a component is cloned, the new model is passed as an argument to the callback
   * * `component:update` - Triggered when a component is updated (moved, styled, etc.), the model is passed as an argument to the callback
   * * `component:update:{propertyName}` - Listen any property change, the model is passed as an argument to the callback
   * * `component:styleUpdate` - Triggered when the style of the component is updated, the model is passed as an argument to the callback
   * * `component:styleUpdate:{propertyName}` - Listen for a specific style property change, the model is passed as an argument to the callback
   * * `component:selected` - New component selected, the selected model is passed as an argument to the callback
   * * `component:deselected` - Component deselected, the deselected model is passed as an argument to the callback
   * * `component:toggled` - Component selection changed, toggled model is passed as an argument to the callback
   * * `component:type:add` - New component type added, the new type is passed as an argument to the callback
   * * `component:type:update` - Component type updated, the updated type is passed as an argument to the callback
   * * `component:drag:start` - Component drag started. Passed an object, to the callback, containing the `target` (component to drag), `parent` (parent of the component) and `index` (component index in the parent)
   * * `component:drag` - During component drag. Passed the same object as in `component:drag:start` event, but in this case, `parent` and `index` are updated by the current pointer
   * * `component:drag:end` - Component drag ended. Passed the same object as in `component:drag:start` event, but in this case, `parent` and `index` are updated by the final pointer
   *
   * ## Methods
   * * [getWrapper](#getwrapper)
   * * [getComponents](#getcomponents)
   * * [addComponent](#addcomponent)
   * * [clear](#clear)
   * * [load](#load)
   * * [store](#store)
   * * [addType](#addtype)
   * * [getType](#gettype)
   * * [getTypes](#gettypes)
   * * [render](#render)
   */
  interface Components {
    /**
     * Load components from the passed object, if the object is empty will try to fetch them
     * autonomously from the selected storage
     * The fetched data will be added to the collection
     * @param data - Object of data to load
     * @returns Loaded data
     */
    load(data: any): any;
    /**
     * Store components on the selected storage
     * @param noStore - If true, won't store
     * @returns Data to store
     */
    store(noStore: boolean): any;
    /**
     * Returns root component inside the canvas. Something like `<body>` inside HTML page
     * The wrapper doesn't differ from the original Component Model
     * @example
     * // Change background of the wrapper and set some attribute
     * var wrapper = cmp.getWrapper();
     * wrapper.set('style', {'background-color': 'red'});
     * wrapper.set('attributes', {'title': 'Hello!'});
     * @returns Root Component
     */
    getWrapper(): Component;
    /**
     * Returns wrapper's children collection. Once you have the collection you can
     * add other Components(Models) inside. Each component can have several nested
     * components inside and you can nest them as more as you wish.
     * @example
     * // Let's add some component
     * var wrapperChildren = cmp.getComponents();
     * var comp1 = wrapperChildren.add({
     *   style: { 'background-color': 'red'}
     * });
     * var comp2 = wrapperChildren.add({
     *   tagName: 'span',
     *   attributes: { title: 'Hello!'}
     * });
     * // Now let's add an other one inside first component
     * // First we have to get the collection inside. Each
     * // component has 'components' property
     * var comp1Children = comp1.get('components');
     * // Procede as before. You could also add multiple objects
     * comp1Children.add([
     *   { style: { 'background-color': 'blue'}},
     *   { style: { height: '100px', width: '100px'}}
     * ]);
     * // Remove comp2
     * wrapperChildren.remove(comp2);
     * @returns Collection of components
     */
    getComponents(): Components;
    /**
     * Add new components to the wrapper's children. It's the same
     * as 'cmp.getComponents().add(...)'
     * @example
     * // Example of a new component with some extra property
     * var comp1 = cmp.addComponent({
     *   tagName: 'div',
     *   removable: true, // Can't remove it
     *   draggable: true, // Can't move it
     *   copyable: true, // Disable copy/past
     *   content: 'Content text', // Text inside component
     *   style: { color: 'red'},
     *   attributes: { title: 'here' }
     * });
     * @param component - Component/s to add
     * @param [component.tagName = 'div'] - Tag name
     * @param [component.type = ''] - Type of the component. Available: ''(default), 'text', 'image'
     * @param [component.removable = true] - If component is removable
     * @param [component.draggable = true] - If is possible to move the component around the structure
     * @param [component.droppable = true] - If is possible to drop inside other components
     * @param [component.badgable = true] - If the badge is visible when the component is selected
     * @param [component.stylable = true] - If is possible to style component
     * @param [component.copyable = true] - If is possible to copy&paste the component
     * @param [component.content = ''] - String inside component
     * @param [component.style = {}] - Style object
     * @param [component.attributes = {}] - Attribute object
     * @param opt - the options object to be used by the [Components.add]{@link getComponents} method
     * @returns Component/s added
     */
    addComponent(
      component: {
        tagName?: string;
        type?: string;
        removable?: boolean;
        draggable?: boolean;
        droppable?: boolean;
        badgable?: boolean;
        stylable?: boolean;
        copyable?: boolean;
        content?: string;
        style?: any;
        attributes?: any;
      },
      opt: any
    ): Component;
    /**
     * Render and returns wrapper element with all components inside.
     * Once the wrapper is rendered, and it's what happens when you init the editor,
     * the all new components will be added automatically and property changes are all
     * updated immediately
     */
    render(): HTMLElement;
    /**
     * Remove all components
     */
    clear(): Components;
    /**
     * Add new component type.
     * Read more about this in [Define New Component](https://grapesjs.com/docs/modules/Components.html#define-new-component)
     * @param type - Component ID
     * @param methods - Component methods
     */
    addType(type: string, methods: AddComponentOptions): Components;
    /**
     * Get component type.
     * Read more about this in [Define New Component](https://grapesjs.com/docs/modules/Components.html#define-new-component)
     * @param type - Component ID
     * @returns Component type definition, eg. `{ model: ..., view: ... }`
     */
    getType(type: string): any;
    /**
     * Remove component type
     * @param type - Component ID
     * @returns Removed component type, undefined otherwise
     */
    removeType(type: string): any | undefined;
    /**
     * Return the array of all types
     */
    getTypes(): any[];
  }

  interface ComponentProperties {
    /**
     * Component type, eg. `text`, `image`, `video`, etc.
     * @defaultValue ''
     */
    type?: string;
    /**
     * HTML tag of the component, eg. `span`. Default: `div`
     * @defaultValue 'div'
     */
    tagName?: string;
    /**
     * Key-value object of the component's attributes, eg. `{ title: 'Hello' }` Default: `{}`
     * @defaultValue {}
     */
    attributes?: Record<string, any>;
    /**
     * Name of the component. Will be used, for example, in Layers and badges
     * @defaultValue ''
     */
    name?: string;
    /**
     * When `true` the component is removable from the canvas, default: `true`
     * @defaultValue true
     */
    removable?: boolean;
    /**
       * Indicates if it's possible to drag the component inside others.
       You can also specify a query string to indentify elements,
       eg. `'.some-class[title=Hello], [data-gjs-type=column]'` means you can drag the component only inside elements
       containing `some-class` class and `Hello` title, and `column` components. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drag is possible. Default: `true`
       * @defaultValue true
       */
    draggable?: boolean | string | ((...params: any[]) => any);
    /**
       * Indicates if it's possible to drop other components inside. You can use
      a query string as with `draggable`. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drop is possible. Default: `true`
       * @defaultValue true
       */
    droppable?: boolean | string | ((...params: any[]) => any);
    /**
     * Set to false if you don't want to see the badge (with the name) over the component. Default: `true`
     * @defaultValue true
     */
    badgable?: boolean;
    /**
       * True if it's possible to style the component.
      You can also indicate an array of CSS properties which is possible to style, eg. `['color', 'width']`, all other properties
      will be hidden from the style manager. Default: `true`
       * @defaultValue true
       */
    stylable?: boolean | String[];
    ///**
    // * Indicate an array of style properties to show up which has been marked as `toRequire`. Default: `[]`
    // * @defaultValue []
    // */
    //`stylable-require`?: String[];
    /**
     * Indicate an array of style properties which should be hidden from the style manager. Default: `[]`
     * @defaultValue []
     */
    unstylable?: String[];
    /**
     * It can be highlighted with 'dotted' borders if true. Default: `true`
     * @defaultValue true
     */
    highlightable?: boolean;
    /**
     * True if it's possible to clone the component. Default: `true`
     * @defaultValue true
     */
    copyable?: boolean;
    /**
     * Indicates if it's possible to resize the component. It's also possible to pass an object as [options for the Resizer](https://github.com/artf/grapesjs/blob/master/src/utils/Resizer.js). Default: `false`
     */
    resizable?: boolean;
    /**
     * Allow to edit the content of the component (used on Text components). Default: `false`
     */
    editable?: boolean;
    /**
     * Set to `false` if you need to hide the component inside Layers. Default: `true`
     * @defaultValue true
     */
    layerable?: boolean;
    /**
     * Allow component to be selected when clicked. Default: `true`
     * @defaultValue true
     */
    selectable?: boolean;
    /**
     * Shows a highlight outline when hovering on the element if `true`. Default: `true`
     * @defaultValue true
     */
    hoverable?: boolean;
    /**
     * This property is used by the HTML exporter as void elements don't have closing tags, eg. `<br/>`, `<hr/>`, etc. Default: `false`
     */
    void?: boolean;
    /**
     * Component default style, eg. `{ width: '100px', height: '100px', 'background-color': 'red' }`
     * @defaultValue {}
     */
    style?: any;
    /**
     * Component related styles, eg. `.my-component-class { color: red }`
     * @defaultValue ''
     */
    styles?: string;
    /**
     * Content of the component (not escaped) which will be appended before children rendering. Default: `''`
     * @defaultValue ''
     */
    content?: string;
    /**
     * Component's icon, this string will be inserted before the name (in Layers and badge), eg. it can be an HTML string '<i class="fa fa-square-o"></i>'. Default: `''`
     * @defaultValue ''
     */
    icon?: string;
    /**
     * Component's javascript. More about it [here](/modules/Components-js.html). Default: `''`
     * @defaultValue ''
     */
    script?: string | ((...params: any[]) => any);
    ///**
    // * You can specify javascript available only in export functions (eg. when you get the HTML).
    //If this property is defined it will overwrite the `script` one (in export functions). Default: `''`
    // * @defaultValue ''
    // */
    //script-export?: string | ((...params: any[]) => any);
    /**
     * Component's traits. More about it [here](/modules/Traits.html). Default: `['id', 'title']`
     * @defaultValue ''
     */
    traits?: (Partial<TraitOptions> | string)[] | Backbone.Collection<Trait>;
    /**
       * Indicates an array of properties which will be inhereted by all NEW appended children.
       For example if you create a component likes this: `{ removable: false, draggable: false, propagate: ['removable', 'draggable'] }`
       and append some new component inside, the new added component will get the exact same properties indicated in the `propagate` array (and the `propagate` property itself). Default: `[]`
       * @defaultValue []
       */
    propagate?: string[];
    /**
       * Set an array of items to show up inside the toolbar when the component is selected (move, clone, delete).
      Eg. `toolbar: [ { attributes: {class: 'fa fa-arrows'}, command: 'tlb-move' }, ... ]`.
      By default, when `toolbar` property is falsy the editor will add automatically commands `core:component-exit` (select parent component, added if there is one), `tlb-move` (added if `draggable`) , `tlb-clone` (added if `copyable`), `tlb-delete` (added if `removable`).
       */
    toolbar?: object[];
    ///**
    // * Children components. Default: `null`
    // */
    components?: Backbone.Collection<Component>;
  }

  interface ComponentDefinition extends Omit<ComponentProperties, 'components'> {
    /**
     * Children components.
     */
    components?: string | ComponentDefinition | (string | ComponentDefinition)[];
    [key: string]: unknown;
  }

  interface ComponentModelProperties extends ComponentProperties {
    [key: string]: any;
  }

  /**
   * The Component object represents a single node of our template structure, so when you update its properties the changes are
   * immediately reflected on the canvas and in the code to export (indeed, when you ask to export the code we just go through all
   * the tree of nodes).
   * An example on how to update properties:
   * ```js
   * component.set({
   *  tagName: 'span',
   *  attributes: { ... },
   *  removable: false,
   * });
   * component.get('tagName');
   * // -> 'span'
   * ```
   *
   * [Component]: component.html
   */
  interface Component extends Backbone.Model<ComponentModelProperties>, Styleable {
    view?: ComponentView;

    /**
     * A randomized unique id associated with the component prefixed with `i`
     */
    ccid?: string

    /**
     * Hook method, called once the model is created
     */
    init(): void;

    /**
     * Hook method, called when the model has been updated (eg. updated some model's property)
     * @param property - Property name, if triggered after some property update
     * @param value - Property value, if triggered after some property update
     * @param previous - Property previous value, if triggered after some property update
     */
    updated(property: string, value: any, previous: any): void;

    /**
     * Hook method, called once the model has been removed
     */
    removed(): void;

    /**
     * Check component's type
     * @example
     * component.is('image')
     * // -> false
     * @param type - Component type
     */
    is(type: string): boolean;

    /**
     * Return all the propeties
     */
    props(): ComponentProperties;

    /**
     * Get the index of the component in the parent collection.
     */
    index(): number;

    /**
     * Change the drag mode of the component.
     * To get more about this feature read: https://github.com/artf/grapesjs/issues/1936
     * @param value - Drag mode, options: 'absolute' | 'translate'
     */
    setDragMode(value: string): this;

    /**
     * Find inner components by query string.
     * **ATTENTION**: this method works only with already rendered component
     * @example
     * component.find('div > .class');
     * // -> [Component, Component, ...]
     * @param query - Query string
     * @returns Array of components
     */
    find(query: string): Component[];

    /**
     * Find all inner components by component type.
     * The advantage of this method over `find` is that you can use it
     * also before rendering the component
     * @example
     * const allImages = component.findType('image');
     * console.log(allImages[0]) // prints the first found component
     * @param type - Component type
     */
    findType(type: string): Component[];

    /**
     * Find the closest parent component by query string.
     * **ATTENTION**: this method works only with already rendered component
     * @example
     * component.closest('div.some-class');
     * // -> Component
     * @param query - Query string
     */
    closest(query: string): Component;

    /**
     * Find the closest parent component by its type.
     * The advantage of this method over `closest` is that you can use it
     * also before rendering the component
     * @example
     * const Section = component.closestType('section');
     * console.log(Section);
     * @param type - Component type
     * @returns Found component, otherwise `undefined`
     */
    closestType(type: string): Component;

    /**
     * The method returns a Boolean value indicating whether the passed
     * component is a descendant of a given component
     * @param component - Component to check
     */
    contains(component: Component): boolean;

    /**
     * Replace a component with another one
     * @example
     * component.replaceWith('<div>Some new content</div>');
     * // -> Component
     * @param el - Component or HTML string
     * @returns New added component/s
     */
    replaceWith(el: string | Component): Component | Component[];

    /**
     * Update attributes of the component
     * @example
     * component.setAttributes({ id: 'test', 'data-key': 'value' });
     * @param attrs - Key value attributes
     * @param options - Options for the model update
     */
    setAttributes(attrs: any, options?: any): this;

    /**
     * Add attributes to the component
     * @example
     * component.addAttributes({ 'data-key': 'value' });
     * @param attrs - Key value attributes
     * @param options - Options for the model update
     */
    addAttributes(attrs: any, options?: any): this;

    /**
     * Remove attributes from the component
     * @example
     * component.removeAttributes('some-attr');
     * component.removeAttributes(['some-attr1', 'some-attr2']);
     * @param attrs - Array of attributes to remove
     * @param options - Options for the model update
     */
    removeAttributes(attrs: string | String[], options?: any): this;

    /**
     * Get the style of the component
     */
    getStyle(): any;

    /**
     * Set the style on the component
     * @example
     * component.setStyle({ color: 'red' });
     * @param prop - Key value style object
     */
    setStyle(prop: any): any;

    /**
     * Return all component's attributes
     */
    getAttributes(): Record<string, any>;

    /**
     * Add classes
     * @example
     * model.addClass('class1');
     * model.addClass('class1 class2');
     * model.addClass(['class1', 'class2']);
     * // -> [SelectorObject, ...]
     * @param classes - Array or string of classes
     * @returns Array of added selectors
     */
    addClass(classes: String[] | string): any[];

    /**
     * Set classes (resets current collection)
     * @example
     * model.setClass('class1');
     * model.setClass('class1 class2');
     * model.setClass(['class1', 'class2']);
     * // -> [SelectorObject, ...]
     * @param classes - Array or string of classes
     * @returns Array of added selectors
     */
    setClass(classes: String[] | string): any[];

    /**
     * Remove classes
     * @example
     * model.removeClass('class1');
     * model.removeClass('class1 class2');
     * model.removeClass(['class1', 'class2']);
     * // -> [SelectorObject, ...]
     * @param classes - Array or string of classes
     * @returns Array of removed selectors
     */
    removeClass(classes: String[] | string): any[];

    /**
     * Returns component's classes as an array of strings
     */
    getClasses(): any[];

    /**
     * Add new component children
     * @example
     * someComponent.get('components').length // -> 0
     * const videoComponent = someComponent.append('<video></video><div></div>')[0];
     * // This will add 2 components (`video` and `div`) to your `someComponent`
     * someComponent.get('components').length // -> 2
     * // You can pass components directly
     * otherComponent.append(otherComponent2);
     * otherComponent.append([otherComponent3, otherComponent4]);
     * // append at specific index (eg. at the beginning)
     * someComponent.append(otherComponent, { at: 0 });
     * @param components - Component to add
     * @param [opts = {}] - Options for the append action
     * @returns Array of appended components
     */
    append(components: Component | string, opts?: any): any[];

    /**
     * Set new collection if `components` are provided, otherwise the
     * current collection is returned
     * @example
     * // Set new collection
     * component.components('<span></span><div></div>');
     * // Get current collection
     * const collection = component.components();
     * console.log(collection.length);
     * // -> 2
     * @param [components] - Component Definitions or HTML string
     * @param [opts = {}] - Options, same as in `Component.append()`
     */
    components(
      components?: Component | string,
      opts?: any
    ): Backbone.Collection<Component>;

    /**
     * If exists, returns the child component at specific index.
     * @example
     * // Return first child
     * component.getChildAt(0);
     * // Return second child
     * component.getChildAt(1);
     * @param index - Index of the component to return
     */
    getChildAt(index: number): any;

    /**
     * If exists, returns the last child component.
     * @example
     * const lastChild = component.getLastChild();
     */
    getLastChild(): any;

    /**
     * Remove all inner components
     * * @return {this}
     */
    empty(): void;

    /**
     * Get the parent component, if exists
     * @example
     * component.parent();
     * // -> Component
     */
    parent(): Component | null;

    /**
     * Get traits.
     * @example
     * const traits = component.getTraits();
     * console.log(traits);
     * // [Trait, Trait, Trait, ...]
     */
    getTraits(): Trait[];

    /**
     * Replace current collection of traits with a new one.
     * @example
     * const traits = component.setTraits([{ type: 'checkbox', name: 'disabled'}, ...]);
     * console.log(traits);
     * // [Trait, ...]
     * @param traits - Array of trait definitions
     */
    setTraits(traits: object[]): Trait[];

    /**
     * Get the trait by id/name.
     * @example
     * const traitTitle = component.getTrait('title');
     * traitTitle && traitTitle.set('label', 'New label');
     * @param id - The `id` or `name` of the trait
     * @returns Trait getModelToStyle
     */
    getTrait(id: string): Trait | null;

    /**
     * Update a trait.
     * @example
     * component.updateTrait('title', {
     *  type: 'select',
     *  options: [ 'Option 1', 'Option 2' ],
     * });
     * @param id - The `id` or `name` of the trait
     * @param props - Object with the props to update
     */
    updateTrait(id: string, props: any): this;

    /**
     * Get the trait position index by id/name. Useful in case you want to
     * replace some trait, at runtime, with something else.
     * @example
     * const traitTitle = component.getTraitIndex('title');
     * console.log(traitTitle); // 1
     * @param id - The `id` or `name` of the trait
     * @returns Index position of the current trait
     */
    getTraitIndex(id: string): number;

    /**
     * Remove trait/s by id/s.
     * @example
     * component.removeTrait('title');
     * component.removeTrait(['title', 'id']);
     * @param id - The `id`/`name` of the trait (or an array)
     * @returns Array of removed traits
     */
    removeTrait(id: string | String[]): Trait[];

    /**
     * Add new trait/s.
     * @example
     * component.addTrait('title', { at: 1 }); // Add title trait (`at` option is the position index)
     * component.addTrait({
     *  type: 'checkbox',
     *  name: 'disabled',
     * });
     * component.addTrait(['title', {...}, ...]);
     * @param trait - Trait to add (or an array of traits)
     * @param opts - Options for the add
     * @returns Array of added traits
     */
    addTrait(
      trait: string | any | (String | object)[],
      opts: Record<string, any>
    ): Trait[];

    /**
     * Get the name of the component
     */
    getName(): string;

    /**
     * Get the icon string
     */
    getIcon(): string;

    /**
     * Return HTML string of the component
     * @example
     * // Simple HTML return
     * component.set({ tagName: 'span' });
     * component.setAttributes({ title: 'Hello' });
     * component.toHTML();
     * // -> <span title="Hello"></span>
     *
     * // Custom attributes
     * component.toHTML({ attributes: { 'data-test': 'Hello' } });
     * // -> <span data-test="Hello"></span>
     *
     * // Custom dynamic attributes
     * component.toHTML({
     *  attributes(component, attributes) {
     *    if (component.get('tagName') == 'span') {
     *      attributes.title = 'Custom attribute';
     *    }
     *    return attributes;
     *  },
     * });
     * // -> <span title="Custom attribute"></span>
     * @param [opts = {}] - Options
     * @param [opts.tag] - Custom tagName
     * @param [opts.attributes = null] - You can pass an object of custom attributes to replace with the current ones or you can even pass a function to generate attributes dynamically.
     * @param [opts.withProps] - Include component properties as `data-gjs-*` attributes. This allows you to have re-importable HTML.
     * @param [opts.altQuoteAttr] - In case the attribute value contains a `"` char, instead of escaping it (`attr="value &quot;"`), the attribute will be quoted using single quotes (`attr='value "'`).
     * @returns HTML string
     */
    toHTML(opts?: {
      tag?: string;
      attributes?: any | ((...params: any[]) => any);
      withProps?: boolean;
      altQuoteAttr?: boolean;
    }): string;

    /**
     * Get inner HTML of the component
     * @param [opts = {}] - Same options of `toHTML`
     * @returns HTML string
     */
    getInnerHTML(opts?: any): string;

    /**
     * Return an object containing only changed props
     */
    getChangedProps(): void;

    /**
     * Get block id
     */
    getId(): string;

    /**
     * Set new id on the component
     */
    setId(id: string): this;

    /**
     * Get the DOM element of the component.
     * This works only if the component is already rendered
     * @param frame - Specific frame from which taking the element
     */
    getEl(frame?: Frame): HTMLElement;

    /**
     * Get the View of the component.
     * This works only if the component is already rendered
     * @param frame - Get View of a specific frame
     */
    getView(frame?: Frame): ComponentView;

    /**
     * Execute callback function on itself and all inner components
     * @example
     * component.onAll(component => {
     *  // do something with component
     * })
     * @param clb - Callback function, the model is passed as an argument
     */
    onAll(clb: (...params: any[]) => any): this;

    /**
     * Remove the component
     */
    remove(): this;

    /**
     * Move the component to another destination component
     * @example
     * // Move the selected component on top of the wrapper
     * const dest = editor.getWrapper();
     * editor.getSelected().move(dest, { at: 0 });
     * @param component - Destination component (so the current one will be appended as a child)
     * @param opts - Options for the append action
     */
    move(component: Component, opts: any): this;
  }

  /**
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/panels/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  panels: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
   *
   * ```js
   * const panelManager = editor.Panels;
   * ```
   *
   * * [addPanel](#addpanel)
   * * [addButton](#addbutton)
   * * [getButton](#getbutton)
   * * [getPanel](#getpanel)
   * * [getPanels](#getpanels)
   * * [getPanelsEl](#getpanelsel)
   * * [removePanel](#removepanel)
   * * [removeButton](#removebutton)
   */
  interface Panels {
    /**
     * Returns the collection of panels
     * @returns Collection of panel
     */
    getPanels(): Backbone.Collection<Panel>;
    /**
     * Returns panels element
     */
    getPanelsEl(): HTMLElement;
    /**
     * Add new panel to the collection
     * @example
     * var newPanel = panelManager.addPanel({
     *   id: 'myNewPanel',
     *  visible  : true,
     *  buttons  : [...],
     * });
     * @param panel - Object with right properties or an instance of Panel
     * @returns Added panel. Useful in case passed argument was an Object
     */
    addPanel(panel: any | Panel): Panel;
    /**
     * Remove a panel from the collection
     * @example
     * const newPanel = panelManager.removePanel({
     *   id: 'myNewPanel',
     *  visible  : true,
     *  buttons  : [...],
     * });
     *
     * const newPanel = panelManager.removePanel('myNewPanel');
     * @param panel - Object with right properties or an instance of Panel or Painel id
     * @returns Removed panel. Useful in case passed argument was an Object
     */
    removePanel(panel: any | Panel | string): Panel;
    /**
     * Get panel by ID
     * @example
     * var myPanel = panelManager.getPanel('myNewPanel');
     * @param id - Id string
     */
    getPanel(id: string): Panel | null;
    /**
     * Add button to the panel
     * @example
     * var newButton = panelManager.addButton('myNewPanel',{
     *   id: 'myNewButton',
     *   className: 'someClass',
     *   command: 'someCommand',
     *   attributes: { title: 'Some title'},
     *   active: false,
     * });
     * // It's also possible to pass the command as an object
     * // with .run and .stop methods
     * ...
     * command: {
     *   run: function(editor) {
     *     ...
     *   },
     *   stop: function(editor) {
     *     ...
     *   }
     * },
     * // Or simply like a which will be evaluated as a single .run command
     * ...
     * command: function(editor) {
     *   ...
     * }
     * @param panelId - Panel's ID
     * @param button - Button object or instance of Button
     * @returns Added button. Useful in case passed button was an Object
     */
    addButton(panelId: string, button: ButtonOptions | Button): Button | null;
    /**
     * Remove button from the panel
     * @example
     * const removedButton = panelManager.addButton('myNewPanel',{
     *   id: 'myNewButton',
     *   className: 'someClass',
     *   command: 'someCommand',
     *   attributes: { title: 'Some title'},
     *   active: false,
     * });
     *
     * const removedButton = panelManager.removeButton('myNewPanel', 'myNewButton');
     * @param panelId - Panel's ID
     * @param buttonId - Button's ID
     * @returns Removed button.
     */
    removeButton(panelId: string, buttonId: string): Button | null;
    /**
     * Get button from the panel
     * @example
     * var button = panelManager.getButton('myPanel','myButton');
     * @param panelId - Panel's ID
     * @param id - Button's ID
     */
    getButton(panelId: string, id: string): Button | null;
  }

  /**
   * With Style Manager you build categories (called sectors) of CSS properties which could be used to customize the style of components.
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/style_manager/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  styleManager: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
   *
   * ```js
   * // Listen to events
   * editor.on('style:sector:add', (sector) => { ... });
   *
   * // Use the API
   * const styleManager = editor.StyleManager;
   * styleManager.addSector(...);
   * ```
   * ## Available Events
   * * `style:sector:add` - Sector added. The [Sector] is passed as an argument to the callback.
   * * `style:sector:remove` - Sector removed. The [Sector] is passed as an argument to the callback.
   * * `style:sector:update` - Sector updated. The [Sector] and the object containing changes are passed as arguments to the callback.
   * * `style:property:add` - Property added. The [Property] is passed as an argument to the callback.
   * * `style:property:remove` - Property removed. The [Property] is passed as an argument to the callback.
   * * `style:property:update` - Property updated. The [Property] and the object containing changes are passed as arguments to the callback.
   * * `style:target` - Target selection changed. The target (or `null` in case the target is deselected) is passed as an argument to the callback.
   * <!--
   * * `styleManager:update:target` - The target (Component or CSSRule) is changed
   * * `styleManager:change` - Triggered on style property change from new selected component, the view of the property is passed as an argument to the callback
   * * `styleManager:change:{propertyName}` - As above but for a specific style property
   * -->
   *
   * ## Methods
   * * [getConfig](#getconfig)
   * * [addSector](#addsector)
   * * [getSector](#getsector)
   * * [getSectors](#getsectors)
   * * [removeSector](#removesector)
   * * [addProperty](#addproperty)
   * * [getProperty](#getproperty)
   * * [getProperties](#getproperties)
   * * [removeProperty](#removeproperty)
   * * [select](#select)
   * * [getSelected](#getselected)
   * * [getSelectedAll](#getselectedall)
   * * [getSelectedParents](#getselectedparents)
   * * [addStyleTargets](#addstyletargets)
   * * [getBuiltIn](#getbuiltin)
   * * [getBuiltInAll](#getbuiltinall)
   * * [addBuiltIn](#addbuiltin)
   * * [addType](#addtype)
   * * [getType](#gettype)
   * * [getTypes](#gettypes)
   *
   * [Sector]: sector.html
   * [CssRule]: css_rule.html
   * [Component]: component.html
   * [Property]: property.html
   */
  interface StyleManager {
    /**
     * Get configuration object
     */
    getConfig(): StyleManagerConfig;
    /**
     * Add new sector. If the sector with the same id already exists, that one will be returned.
     * @example
     * const sector = styleManager.addSector('mySector',{
     *   name: 'My sector',
     *   open: true,
     *   properties: [{ name: 'My property'}]
     * }, { at: 0 });
     * // With `at: 0` we place the new sector at the beginning of the list
     * @param id - Sector id
     * @param sector - Sector definition. Check the [available properties](sector.html#properties)
     * @param [options = {}] - Options
     * @param [options.at] - Position index (by default, will be appended at the end).
     */
    addSector(
      id: string,
      sector: any,
      options?: {
        at?: number;
      }
    ): any;
    /**
     * Get sector by id.
     * @example
     * const sector = styleManager.getSector('mySector');
     * @param id - Sector id
     */
    getSector(id: string): any;
    /**
     * Get all sectors.
     * @example
     * const sectors = styleManager.getSectors();
     * @param [opts = {}] - Options
     * @param [opts.visible] - Returns only visible sectors
     */
    getSectors(opts?: { visible?: boolean }): any;
    /**
     * Remove sector by id.
     * @example
     * const removed = styleManager.removeSector('mySector');
     * @param id - Sector id
     */
    removeSector(id: string): any;
    /**
     * Add new property to the sector.
     * @example
     * const property = styleManager.addProperty('mySector', {
     *   label: 'Minimum height',
     *   property: 'min-height',
     *   type: 'select',
     *   default: '100px',
     *   options: [
     *    { id: '100px', label: '100' },
     *    { id: '200px', label: '200' },
     *   ],
     * }, { at: 0 });
     * @param sectorId - Sector id.
     * @param property - Property definition. Check the [base available properties](property.html#properties) + others based on the `type` of your property.
     * @param [opts = {}] - Options
     * @param [opts.at] - Position index (by default, will be appended at the end).
     */
    addProperty(
      sectorId: string,
      property: any,
      opts?: {
        at?: number;
      }
    ): any;
    /**
     * Get the property.
     * @example
     * const property = styleManager.getProperty('mySector', 'min-height');
     * @param sectorId - Sector id.
     * @param id - Property id.
     */
    getProperty(sectorId: string, id: string): any;
    /**
     * Get all properties of the sector.
     * @example
     * const properties = styleManager.getProperties('mySector');
     * @param sectorId - Sector id.
     */
    getProperties(sectorId: string): any;
    /**
     * Remove the property.
     * @example
     * const property = styleManager.removeProperty('mySector', 'min-height');
     * @param sectorId - Sector id.
     * @param id - Property id.
     */
    removeProperty(sectorId: string, id: string): any;
    /**
     * Select new target.
     * The target could be a Component, CSSRule, or a CSS selector string.
     * @example
     * // Select the first button in the current page
     * const wrapperCmp = editor.Pages.getSelected().getMainComponent();
     * const btnCmp = wrapperCmp.find('button')[0];
     * btnCmp && styleManager.select(btnCmp);
     *
     * // Set as a target the CSS selector
     * styleManager.select('.btn > span');
     */
    select(toSelect: any): any;
    /**
     * Get the last selected target.
     * By default, the Style Manager shows styles of the last selected target.
     */
    getSelected(): any;
    /**
     * Get the array of selected targets.
     */
    getSelectedAll(): any;
    /**
     * Get parent rules of the last selected target.
     */
    getSelectedParents(): any;
    /**
     * Update selected targets with a custom style.
     * @example
     * styleManager.addStyleTargets({ color: 'red' });
     * @param style - Style object
     * @param [opts = {}] - Options
     */
    addStyleTargets(style: any, opts?: any): void;
    /**
     * Return built-in property definition
     * @example
     * const widthPropDefinition = styleManager.getBuiltIn('width');
     * @param prop - Property name.
     * @returns Property definition.
     */
    getBuiltIn(prop: string): any | null;
    /**
     * Get all the available built-in property definitions.
     */
    getBuiltInAll(): any;
    /**
     * Add built-in property definition.
     * If the property exists already, it will extend it.
     * @example
     * const sector = styleManager.addBuiltIn('new-property', {
     *  type: 'select',
     *  default: 'value1',
     *  options: [{ id: 'value1', label: 'Some label' }, ...],
     * })
     * @param prop - Property name.
     * @param definition - Property definition.
     * @returns Added property definition.
     */
    addBuiltIn(prop: string, definition: any): any;
    /**
     * Add new property type
     * @example
     * styleManager.addType('my-custom-prop', {
     *    // Create UI
     *    create({ props, change }) {
     *      const el = document.createElement('div');
     *      el.innerHTML = '<input type="range" class="my-input" min="10" max="50"/>';
     *      const inputEl = el.querySelector('.my-input');
     *      inputEl.addEventListener('change', event => change({ event }));
     *      inputEl.addEventListener('input', event => change({ event, partial: true }));
     *      return el;
     *    },
     *    // Propagate UI changes up to the targets
     *    emit({ props, updateStyle }, { event, partial }) {
     *      const { value } = event.target;
     *      updateStyle(`${value}px`, { partial });
     *    },
     *    // Update UI (eg. when the target is changed)
     *    update({ value, el }) {
     *      el.querySelector('.my-input').value = parseInt(value, 10);
     *    },
     *    // Clean the memory from side effects if necessary (eg. global event listeners, etc.)
     *    destroy() {}
     * })
     * @param id - Type ID
     * @param definition - Definition of the type.
     */
    addType(id: string, definition: any): void;
    /**
     * Get type
     * @param id - Type ID
     * @returns Type definition
     */
    getType(id: string): any;
    /**
     * Get all types
     */
    getTypes(): any[];
  }

  interface SectorOptions {
    /**
     * Sector id, eg. `typography`
     */
    id: string;
    /**
     * Sector name, eg. `Typography`
     */
    name: string;
    /**
     * Indicates the open state.
     * @defaultValue true
     */
    open?: boolean;
    /**
     * Indicate an array of Property defintions.
     * @defaultValue []
     */
    properties?: AnyProperty[];
  }

  interface Sector extends Backbone.Model<SectorOptions> {
    /**
     * Get sector id
     */
    getId(): string;

    /**
     * Get sector name
     */
    getName(): string;

    /**
     * Update sector name.
     * @param value - New sector name
     */
    setName(value: string): void;

    /**
     * Check if the sector is open
     */
    isOpen(): boolean;

    /**
     * Update Sector open state
     */
    setOpen(value: boolean): void;

    /**
     * Check if the sector is visible
     */
    isVisible(): boolean;

    /**
     * Get sector properties.
     * @param [opts = {}] - Options
     * @param [opts.withValue = false] - Get only properties with value
     * @param [opts.withParentValue = false] - Get only properties with parent value
     */
    getProperties(opts?: {
      withValue?: boolean;
      withParentValue?: boolean;
    }): AnyProperty[];
  }

  interface PropertyOptions {
    /**
     * Property id, eg. `my-property-id`.
     */
    id: string;
    /**
     * Related CSS property name, eg. `text-align`.
     */
    property: string;
    /**
     * Defaul value of the property.
     */
    default: string;
    /**
     * Label to use in UI, eg. `Text Align`.
     */
    label: string;
    /**
       * Change callback.
      \n
      ```js
       onChange: ({ property, from, to }) => {
         console.log(`Changed property`, property.getName(), { from, to });
       }
      ```
       */
    onChange?: (...params: any[]) => any;
  }

  interface Property<T extends PropertyOptions> extends Backbone.Model<T> {
    /**
     * Get property id
     */
    getId(): string;

    /**
     * Get the property type.
     * The type of the property is defined on property creation and based on its value the proper Property class is assigned.
     * The default type is `base`.
     */
    getType(): string;

    /**
     * Get name (the CSS property name).
     */
    getName(): string;

    /**
     * Get property label.
     * @param {Object} [opts={}] Options
     * @param {Boolean} [opts.locale=true] Use the locale string from i18n module
     */
    getLabel(opts?: { locale?: boolean }): string;

    /**
     * Get property value.
     * @param [opts = {}] - Options
     * @param [opts.noDefault = false] - Avoid returning the default value
     */
    getValue(opts?: { noDefault?: boolean }): string;

    /**
     * Check if the property has value.
     * @param [opts = {}] - Options
     * @param [opts.noParent = false] - Ignore the value if it comes from the parent target.
     */
    hasValue(opts?: { noParent?: boolean }): boolean;

    /**
     * Indicates if the current value is coming from a parent target (eg. another CSSRule).
     */
    hasValueParent(): boolean;

    /**
     * Get the CSS style object of the property.
     * @param {Object} [opts={}] Options
     * @param {Boolean} [opts.camelCase] Return property name in camelCase.
     * @example
     * // In case the property is `color` with a value of `red`.
     * console.log(property.getStyle());
     * // { color: 'red' };
     */
    getStyle(opts?: { camelCase?: boolean }): any;

    /**
     * Get the default value.
     */
    getDefaultValue(): string;

    /**
     * Update the value.
     * The change is also propagated to the selected targets (eg. CSS rule).
     * @param value - New value
     * @param [opts = {}] - Options
     * @param [opts.partial = false] - If `true` the update on targets won't be considered complete (not stored in UndoManager)
     * @param [opts.noTarget = false] - If `true` the change won't be propagated to selected targets.
     */
    upValue(
      value: string,
      opts?: {
        partial?: boolean;
        noTarget?: boolean;
      }
    ): void;

    /**
     * Check if the sector is visible
     */
    isVisible(): boolean;

    /**
     * Clear the value.
     * The change is also propagated to the selected targets (eg. the css property is cleared).
     * @param [opts = {}] - Options
     * @param [opts.noTarget = false] - If `true` the change won't be propagated to selected targets.
     */
    clear(opts?: { noTarget?: boolean }): void;

    /**
     * Indicates if the current value comes directly from the selected target and so can be cleared.
     */
    canClear(): boolean;

    /**
     * If the current property is a sub-property, this will return the parent Property.
     */
    getParent(): any;

    /**
     * Indicates if the property is full-width in UI.
     */
    isFull(): boolean;
  }

  interface PropertyNumberOptions extends PropertyOptions {
    /**
     * Array of units, eg. `['px', '%']`
     */
    units: String[];
    /**
     * Minimum value.
     */
    min: number;
    /**
     * Maximum value.
     */
    max: number;
    /**
     * Step value.
     */
    step: number;
  }

  interface PropertyNumber extends Property<PropertyNumberOptions> {
    /**
     * Get property units.
     */
    getUnits(): String[];

    /**
     * Get property unit value.
     */
    getUnit(): string;

    /**
     * Get min value.
     */
    getMin(): number;

    /**
     * Get max value.
     */
    getMax(): number;

    /**
     * Get step value.
     */
    getStep(): number;

    /**
     * Update property unit value.
     * The change is also propagated to the selected targets.
     * @param unit - New unit value
     * @param [opts = {}] - Options
     * @param [opts.noTarget = false] - If `true` the change won't be propagated to selected targets.
     */
    upUnit(
      unit: string,
      opts?: {
        noTarget?: boolean;
      }
    ): string;
  }

  interface SelectOption {
    id?: string;
    value?: string;
    label?: string;
    name?: string;
  }

  interface PropertySelectOptions extends PropertyOptions {
    /**
       * Array of option definitions.
      \n
      ```js
      options: [
       { id: '100', label: 'Set 100' },
       { id: '200', label: 'Set 200' },
      ]
      ```
       */
    options: SelectOption[];
  }

  interface PropertySelect extends Property<PropertySelectOptions> {
    /**
     * Get available options.
     * @returns Array of options
     */
    getOptions(): SelectOption[];

    /**
     * Get current selected option or by id.
     * @param [id] - Option id.
     */
    getOption(id?: string): any | null;

    /**
     * Update options.
     * @param value - New array of options, eg. `[{ id: 'val-1', label: 'Value 1' }]`
     */
    setOptions(value: SelectOption[]): void;

    /**
     * Add new option.
     * @param value - Option object, eg. `{ id: 'val-1', label: 'Value 1' }`
     */
    addOption(value: SelectOption): void;

    /**
     * Get the option id from the option object.
     * @param option - Option object
     * @returns Option id
     */
    getOptionId(option: SelectOption): string;

    /**
     * Get option label.
     * @param id - Option id or the option object
     * @param [opts = {}] - Options
     * @param [opts.locale = true] - Use the locale string from i18n module
     * @returns Option label
     */
    getOptionLabel(
      id: string | any,
      opts?: {
        locale?: boolean;
      }
    ): string;
  }

  interface PropertyCompositeOptions extends PropertyOptions {
    /**
     * Array of sub properties, eg. `[{ type: 'number', property: 'margin-top' }, ...]`
     */
    properties: AnyProperty[];
    /**
     * Indicate if the final CSS property is splitted (detached: `margin-top: X; margin-right: Y; ...`) or combined (not detached: `margin: X Y ...;`)
     */
    detached?: boolean;
    /**
     * Value used to split property values, default `" "`.
     * @defaultValue ' '
     */
    separator?: string | RegExp;
    /**
     * Value used to join property values, default `" "`.
     * @defaultValue ' '
     */
    join?: string;
    /**
       * Custom logic for getting property values from the target style object.
      \n
      ```js
       fromStyle: (style) => {
         const margins = parseMarginShorthand(style.margin);
         return {
           'margin-top': margins.top,
           // ...
         };
       }
      ```
       */
    fromStyle?: (style: Record<string, any>) => Record<string, any>;
    /**
       * Custom logic for creating the CSS style object to apply on selected targets.
      \n
      ```js
       toStyle: (values) => {
         const top = values['margin-top'] || 0;
         const right = values['margin-right'] || 0;
         // ...
         return {
           margin: `${top} ${right} ...`,
         };
       }
      ```
       */
    toStyle?: (values: Record<string, any>) => Record<string, any>;
  }
  interface PropertyComposite<T extends PropertyCompositeOptions>
    extends Property<T> {
    /**
     * Get properties.
     */
    getProperties(): AnyProperty[];

    /**
     * Get property by id.
     * @param id - Property id.
     */
    getProperty(id: string): any;

    /**
     * Get property at index.
     */
    getPropertyAt(index: number): any;

    /**
     * Check if the property is detached.
     */
    isDetached(): boolean;

    /**
     * Get current values of properties.
     * @example
     * // In case the property is `margin` with sub properties like `margin-top`, `margin-right`, etc.
     * console.log(property.getValues());
     * // { 'margin-top': '10px', 'margin-right': '20px', ... };
     * @param [opts = {}] - Options
     * @param [opts.byName = false] - Use property names as a key instead of the id.
     */
    getValues(opts?: { byName?: boolean }): any;

    /**
     * Get property separator.
     */
    getSeparator(): RegExp;

    /**
     * Get the join value.
     */
    getJoin(): string;
  }

  type AnyProperty =
    | Property<PropertyOptions>
    | PropertyNumber
    | PropertySelect
    | PropertyComposite<PropertyCompositeOptions>
    | PropertyStack;

  interface Layer extends Backbone.Model<{}> {
    /**
     * Get layer id.
     */
    getId(): string;

    /**
     * Get layer index.
     */
    getIndex(): number;

    /**
     * Get layer values.
     * @param {Object} [opts={}] Options
     * @param {Boolean} [opts.camelCase] Return property names in camelCase.
     */
    getValues(opts?: { camelCase?: boolean }): any;

    /**
     * Get layer label.
     */
    getLabel(): string;

    /**
     * Check if the layer is selected.
     */
    isSelected(): boolean;

    /**
     * Select the layer.
     */
    select(): any;

    /**
     * Remove the layer.
     */
    remove(): any;

    /**
     * Move layer to a new index.
     * @param index New index
     */
    move(index: number): any;

    /**
     * Get style object for the preview.
     * @param [opts={}] Options. Same of `PropertyStack.getStyleFromLayer`
     * @returns Style object
     */
    getStylePreview(opts: object): any;

    /**
     * Check if the property has the preview enabled for this layer.
     */
    hasPreview(): boolean;
  }

  interface PropertyStackOptions extends PropertyCompositeOptions {
    /**
     * Indicate if the layer should display a preview.
     */
    preview?: boolean;
    /**
     * The separator used to split layer values.
     * @defaultValue ', '
     */
    layerSeparator?: string | RegExp;
    /**
     * Value used to join layer values.
     * @defaultValue ', '
     */
    layerJoin?: string;
    /**
       * Custom logic for creating layer labels.
      \n
      ```js
       layerLabel: (layer) => {
         const values = layer.getValues();
         return `A: ${values['prop-a']} B: ${values['prop-b']}`;
       }
       ```
       */
    layerLabel?: (...params: any[]) => any;
  }

  interface PropertyStack extends PropertyComposite<PropertyStackOptions> {
    /**
     * Get all available layers.
     */
    getLayers(): Layer[];

    /**
     * Get layer by index.
     * @example
     * // Get the first layer
     * const layerFirst = property.getLayer(0);
     * // Get the last layer
     * const layers = this.getLayers();
     * const layerLast = property.getLayer(layers.length - 1);
     * @param [index = 0] - Layer index position.
     */
    getLayer(index?: number): Layer | null;

    /**
     * Get selected layer.
     */
    getSelectedLayer(): Layer | null;

    /**
     * Select layer.
     * Without a selected layer any update made on inner properties has no effect.
     * @example
     * const layer = property.getLayer(0);
     * property.selectLayer(layer);
     * @param layer Layer to select
     */
    selectLayer(layer: Layer): void;

    /**
     * Select layer by index.
     * @example
     * property.selectLayerAt(1);
     * @param index - Index of the layer to select.
     */
    selectLayerAt(index: number): void;

    /**
     * Move layer by index.
     * @example
     * const layer = property.getLayer(1);
     * property.moveLayer(layer, 0);
     * @param index - New layer index.
     */
    moveLayer(layer: Layer, index: number): void;

    /**
     * Add new layer to the stack.
     * @example
     * // Add new layer at the beginning of the stack with custom values
     * property.addLayer({ 'sub-prop1': 'value1', 'sub-prop2': 'value2' }, { at: 0 });
     * @param [props = {}] - Custom property values to use in a new layer.
     * @param [opts = {}] - Options
     * @param [opts.at] - Position index (by default the layer will be appended at the end).
     */
    addLayer(
      props?: any,
      opts?: {
        at?: number;
      }
    ): Layer;

    /**
     * Remove layer.
     * @example
     * const layer = property.getLayer(0);
     * property.removeLayer(layer);
     */
    removeLayer(layer: Layer): Layer;

    /**
     * Remove layer by index.
     * @example
     * property.removeLayerAt(0);
     * @param index - Index of the layer to remove
     */
    removeLayerAt(index: number): Layer | null;

    /**
     * Get the layer label. The label can be customized with the `layerLabel` property.
     * @example
     * const layer = this.getLayer(1);
     * const label = this.getLayerLabel(layer);
     */
    getLayerLabel(layer: Layer): string;

    /**
     * Get style object from the layer.
     * @param [opts = {}] - Options
     * @param [opts.camelCase] - Return property names in camelCase.
     * @param [opts.number] - Limit the result of the number types, eg. `number: { min: -3, max: 3 }`
     * @returns Style object
     */
    getStyleFromLayer(
      layer: Layer,
      opts?: {
        camelCase?: boolean;
        number?: any;
      }
    ): any;

    /**
     * Get preview style object from the layer.
     * If the property has `preview: false` the returned object will be empty.
     * @param [opts = {}] - Options. Same of `getStyleFromLayer`
     * @returns Style object
     */
    getStylePreview(layer: Layer, opts?: any): any;

    /**
     * Get layer separator.
     */
    getLayerSeparator(): RegExp;
  }

  /**
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/storage_manager/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  storageManager: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
   *
   * ```js
   * // Listen to events
   * editor.on('storage:start', () => { ... });
   *
   * // Use the API
   * const storageManager = editor.StorageManager;
   * storageManager.add(...);
   * ```
   *
   * ## Available Events
   * * `storage:start` - Before the storage request is started
   * * `storage:start:store` - Before the store request. The object to store is passed as an argumnet (which you can edit)
   * * `storage:start:load` - Before the load request. Items to load are passed as an argumnet (which you can edit)
   * * `storage:load` - Triggered when something was loaded from the storage, loaded object passed as an argumnet
   * * `storage:store` - Triggered when something is stored to the storage, stored object passed as an argumnet
   * * `storage:end` - After the storage request is ended
   * * `storage:end:store` - After the store request
   * * `storage:end:load` - After the load request
   * * `storage:error` - On any error on storage request, passes the error as an argument
   * * `storage:error:store` - Error on store request, passes the error as an argument
   * * `storage:error:load` - Error on load request, passes the error as an argument
   *
   * ## Methods
   * * [getConfig](#getconfig)
   * * [isAutosave](#isautosave)
   * * [setAutosave](#setautosave)
   * * [getStepsBeforeSave](#getstepsbeforesave)
   * * [setStepsBeforeSave](#setstepsbeforesave)
   * * [setStepsBeforeSave](#setstepsbeforesave)
   * * [getStorages](#getstorages)
   * * [getCurrent](#getcurrent)
   * * [getCurrentStorage](#getcurrentstorage)
   * * [setCurrent](#setcurrent)
   * * [add](#add)
   * * [get](#get)
   * * [store](#store)
   * * [load](#load)
   */
  interface StorageManager {
    /**
     * Get configuration object
     */
    getConfig(): StorageManagerConfig;
    /**
     * Checks if autosave is enabled
     */
    isAutosave(): boolean;
    /**
     * Set autosave value
     */
    setAutosave(v: boolean): this;
    /**
     * Returns number of steps required before trigger autosave
     */
    getStepsBeforeSave(): number;
    /**
     * Set steps required before trigger autosave
     */
    setStepsBeforeSave(v: number): this;
    /**
     * Add new storage
     * @example
     * storageManager.add('local2', {
     *   async load(storageOptions) {
     *     // ...
     *   },
     *   async store(data, storageOptions) {
     *     // ...
     *   },
     * });
     * @param id - Storage ID
     * @param storage - Storage wrapper
     * @param storage.load - Load method
     * @param storage.store - Store method
     */
     add<T extends StorageOptions>(id: string, storage: IStorage<T>): this;
    /**
     * Returns storage by id
     * @param id - Storage ID
     */
    get(id: string): IStorage | null;
    /**
     * Returns all storages
     */
    getStorages(): Record<string, IStorage>;
    /**
     * Returns current storage type
     */
    getCurrent(): string;
    /**
     * Set current storage type
     * @param id - Storage ID
     */
    setCurrent(id: string): this;
    /**
     * Store data in the current storage.
     * @param data Project data.
     * @param options Storage options.
     * @returns Stored data.
     * @example
     * const data = editor.getProjectData();
     * await storageManager.store(data);
     */
    store(data: ProjectData, options: StorageOptions): Promise<ProjectData>;
    /**
     * Load resource from the current storage by keys
     * @param options Storage options.
     * @returns Loaded data.
     * @example
     * const data = await storageManager.load();
     * editor.loadProjectData(data);
     * */
    load(options: StorageOptions): Promise<ProjectData>;
    /**
     * Get current storage
     */
    getCurrentStorage(): IStorage;
    /**
     * Get storage options by type.
     * @param type Storage type
     * @returns Storage Options
     * */
    getStorageOptions(type: string): StorageOptions;
  }

  interface ProjectData {

  }

  interface StorageOptions {

  }

  interface IStorage<T extends StorageOptions = {}> {
    load: (options: T) => Promise<ProjectData>;
    store: (data: ProjectData, options: T) => Promise<any>;
    [key: string]: any,
  }

  /**
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/device_manager/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  deviceManager: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
   *
   * ```js
   * const deviceManager = editor.Devices;
   * ```
   * ## Available Events
   * * `device:add` - Added new device. The [Device] is passed as an argument to the callback
   * * `device:remove` - Device removed. The [Device] is passed as an argument to the callback
   * * `device:select` - New device selected. The newly selected [Device] and the previous one, are passed as arguments to the callback
   * * `device:update` - Device updated. The updated [Device] and the object containing changes are passed as arguments to the callback
   * * `device` - Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback
   *
   * ## Methods
   * * [add](#add)
   * * [get](#get)
   * * [getDevices](#getdevices)
   * * [remove](#remove)
   * * [select](#select)
   * * [getSelected](#getselected)
   *
   * [Device]: device.html
   */
  interface Devices {
    /**
     * Add new device
     * @example
     * const device1 = deviceManager.add({
     *  // Without an explicit ID, the `name` will be taken. In case of missing `name`, a random ID will be created.
     *  id: 'tablet',
     *  name: 'Tablet',
     *  width: '900px', // This width will be applied on the canvas frame and for the CSS media
     * });
     * const device2 = deviceManager.add({
     *  id: 'tablet2',
     *  name: 'Tablet 2',
     *  width: '800px', // This width will be applied on the canvas frame
     *  widthMedia: '810px', // This width that will be used for the CSS media
     *  height: '600px', // Height will be applied on the canvas frame
     * });
     * @param props - Device properties
     */
    add(props: any): any;
    /**
     * Return device by ID
     * @example
     * const device = deviceManager.get('Tablet');
     * console.log(JSON.stringify(device));
     * // {name: 'Tablet', width: '900px'}
     * @param id - ID of the device
     */
    get(id: string): any;
    /**
     * Remove device
     * @example
     * const removed = deviceManager.remove('device-id');
     * // or by passing the Device
     * const device = deviceManager.get('device-id');
     * deviceManager.remove(device);
     */
    remove(): any;
    /**
     * Return all devices
     * @example
     * const devices = deviceManager.getDevices();
     * console.log(JSON.stringify(devices));
     * // [{name: 'Desktop', width: ''}, ...]
     */
    getDevices(): any;
    /**
     * Change the selected device. This will update the frame in the canvas
     * @example
     * deviceManager.select('some-id');
     * // or by passing the page
     * const device = deviceManager.get('some-id');
     * deviceManager.select(device);
     */
    select(device: string | any): void;
    /**
     * Get the selected device
     * @example
     * const selected = deviceManager.getSelected();
     */
    getSelected(): any;
  }

  interface DeviceOptions {
    /**
     * Device type, eg. `Mobile`
     * @defaultValue ''
     */
    name?: string;
    /**
     * Width to set for the editor iframe, eg. '900px'
     */
    width?: string;
    /**
     * Height to set for the editor iframe, eg. '600px'
     * @defaultValue ''
     */
    height?: string;
    /**
     * The width which will be used in media queries, If empty the width will be used
     * @defaultValue ''
     */
    widthMedia?: string;
    /**
     * Setup the order of media queries
     */
    priority?: number;
  }

  interface Device extends Backbone.Model<DeviceOptions> {
    id?: string,
    getName(): string;
    getWidthMedia(): string;
  }

  /**
   * Selectors in GrapesJS are used in CSS Composer inside Rules and in Components as classes. To illustrate this concept let's take
   * a look at this code:
   *
   * ```css
   * span > #send-btn.btn{
   *  ...
   * }
   * ```
   * ```html
   * <span>
   *   <button id="send-btn" class="btn"></button>
   * </span>
   * ```
   *
   * In this scenario we get:
   * * span     -> selector of type `tag`
   * * send-btn -> selector of type `id`
   * * btn      -> selector of type `class`
   *
   * So, for example, being `btn` the same class entity it'll be easier to refactor and track things.
   *
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/selector_manager/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  selectorManager: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
   *
   * ```js
   * // Listen to events
   * editor.on('selector:add', (selector) => { ... });
   *
   * // Use the API
   * const sm = editor.Selectors;
   * sm.add(...);
   * ```
   *
   * ## Available Events
   * * `selector:add` - Selector added. The [Selector] is passed as an argument to the callback.
   * * `selector:remove` - Selector removed. The [Selector] is passed as an argument to the callback.
   * * `selector:update` - Selector updated. The [Selector] and the object containing changes are passed as arguments to the callback.
   * * `selector:state` - States changed. An object containing all the available data about the triggered event is passed as an argument to the callback.
   * * `selector` - Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
   *
   * ## Methods
   * * [getConfig](#getconfig)
   * * [add](#add)
   * * [get](#get)
   * * [remove](#remove)
   * * [getAll](#getall)
   * * [setState](#setstate)
   * * [getState](#getstate)
   * * [getStates](#getstates)
   * * [setStates](#setstates)
   * * [getSelected](#getselected)
   * * [addSelected](#addselected)
   * * [removeSelected](#removeselected)
   * * [getSelectedTargets](#getselectedtargets)
   * * [setComponentFirst](#setcomponentfirst)
   * * [getComponentFirst](#getcomponentfirst)
   *
   * [Selector]: selector.html
   * [State]: state.html
   * [Component]: component.html
   * [CssRule]: css_rule.html
   */
  interface SelectorManager {
    /**
     * Get configuration object
     */
    getConfig(): SelectorManagerConfig;
    /**
     * Add a new selector to the collection if it does not already exist.
     * You can pass selectors properties or string identifiers.
     * @example
     * const selector = selectorManager.add({ name: 'my-class', label: 'My class' });
     * console.log(selector.toString()) // `.my-class`
     * // Same as
     * const selector = selectorManager.add('.my-class');
     * console.log(selector.toString()) // `.my-class`
     * @param props - Selector properties or string identifiers, eg. `{ name: 'my-class', label: 'My class' }`, `.my-cls`
     * @param [opts] - Selector options
     */
    add(props: any | string, opts?: SelectorOptions): any;
    /**
     * Get the selector by its name/type
     * @example
     * const selector = selectorManager.get('.my-class');
     * // Get Id
     * const selectorId = selectorManager.get('#my-id');
     * @param name - Selector name or string identifier
     */
    get(name: string): any;
    /**
     * Remove Selector.
     * @example
     * const removed = selectorManager.remove('.myclass');
     * // or by passing the Selector
     * selectorManager.remove(selectorManager.get('.myclass'));
     */
    remove(): any;
    /**
     * Change the selector state
     * @example
     * selectorManager.setState('hover');
     * @param value - State value
     */
    setState(value: string): this;
    /**
     * Get the current selector state value
     */
    getState(): string;
    /**
     * Get states
     */
    getStates(): any;
    /**
     * Set a new collection of states
     * @example
     * const states = selectorManager.setStates([
     *   { name: 'hover', label: 'Hover' },
     *   { name: 'nth-of-type(2n)', label: 'Even/Odd' }
     * ]);
     * @param states - Array of new states
     */
    setStates(states: object[]): any;
    /**
     * Get commonly selected selectors, based on all selected components.
     * @example
     * const selected = selectorManager.getSelected();
     * console.log(selected.map(s => s.toString()))
     */
    getSelected(): any;
    /**
     * Add new selector to all selected components.
     * @example
     * selectorManager.addSelected('.new-class');
     * @param props - Selector properties or string identifiers, eg. `{ name: 'my-class', label: 'My class' }`, `.my-cls`
     */
    addSelected(props: any | string): void;
    /**
     * Remove a common selector from all selected components.
     * @example
     * selectorManager.removeSelected('.myclass');
     */
    removeSelected(): void;
    /**
     * Get the array of currently selected targets.
     * @example
     * const targetsToStyle = selectorManager.getSelectedTargets();
     * console.log(targetsToStyle.map(target => target.getSelectorsString()))
     */
    getSelectedTargets(): any;
    /**
     * Update component-first option.
     * If the component-first is enabled, all the style changes will be applied on selected components (ID rules) instead
     * of selectors (which would change styles on all components with those classes).
     */
    setComponentFirst(value: boolean): void;
    /**
     * Get the value of component-first option.
     */
    getComponentFirst(): boolean;
    /**
     * Get all selectors
     */
    getAll(): any;

    select(value: any): any;

    getSelectedAll(): Selector[];
  }

  interface SelectorOptions {
    /**
     * Selector name, eg. `my-class`
     */
    name: string;
    /**
     * Selector label, eg. `My Class`
     */
    label: string;
    /**
     * Type of the selector. 1 (class) | 2 (id)
     * @defaultValue 1
     */
    type?: number;
    /**
     * If not active, it's not selectable by the Style Manager.
     * @defaultValue true
     */
    active?: boolean;
    /**
     * If true, it can't be seen by the Style Manager, but it will be rendered in the canvas and in export code.
     */
    private?: boolean;
    /**
     * If true, it can't be removed from the attacched component.
     */
    protected?: boolean;
  }

  interface Selector extends Backbone.Model<SelectorOptions> {
    /**
     * Get selector label.
     * @example
     * // Given such selector: { name: 'my-selector', label: 'My selector' }
     * console.log(selector.getLabel());
     * // -> `My selector`
     */
    getLabel(): string;

    /**
     * Update selector label.
     * @param {String} label New label
     * @example
     * // Given such selector: { name: 'my-selector', label: 'My selector' }
     * selector.setLabel('New Label')
     * console.log(selector.getLabel());
     * // -> `New Label`
     */
    setLabel(label: string): void;

    /**
     * Get selector active state.
     */
    getActive(): boolean;

    /**
     * Update selector active state.
     * @param value - New active state
     */
    setActive(value: boolean): void;
  }

  interface StateOptions {
    /**
     * State name, eg. `hover`, `nth-of-type(2n)`
     */
    name: string;
    /**
     * State label, eg. `Hover`, `Even/Odd`
     */
    label: string;
  }

  interface State extends Backbone.Model<StateOptions> {
    /**
     * Get state name
     */
    getName(): string;

    /**
     * Get state label. If label was not provided, the name will be returned.
     */
    getLabel(): string;
  }

  /**
   * This module manages CSS rules in the canvas.
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/css_composer/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  cssComposer: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
   *
   * ```js
   * const css = editor.Css;
   * ```
   *
   * * [addRules](#addrules)
   * * [setRule](#setrule)
   * * [getRule](#getrule)
   * * [getRules](#getrules)
   * * [remove](#remove)
   * * [clear](#clear)
   *
   * [CssRule]: css_rule.html
   */
  interface CssComposer {
    /**
     * Add CssRules via CSS string.
     * @example
     * const addedRules = css.addRules('.my-cls{ color: red } @media (max-width: 992px) { .my-cls{ color: darkred } }');
     * // Check rules
     * console.log(addedRules.map(rule => rule.toCSS()));
     * @param css - CSS string of rules to add.
     */
    addRules(css: string): any;
    /**
     * Add/update the CssRule.
     * @example
     * // Simple class-based rule
     * const rule = css.setRule('.class1.class2', { color: 'red' });
     * console.log(rule.toCSS()) // output: .class1.class2 { color: red }
     * // With state and other mixed selector
     * const rule = css.setRule('.class1.class2:hover, div#myid', { color: 'red' });
     * // output: .class1.class2:hover, div#myid { color: red }
     * // With media
     * const rule = css.setRule('.class1:hover', { color: 'red' }, {
     *  atRuleType: 'media',
     *  atRuleParams: '(min-width: 500px)',
     * });
     * // output: @media (min-width: 500px) { .class1:hover { color: red } }
     * @param selectors - Selector string, eg. `.myclass`
     * @param style - Style properties and values
     * @param [opts = {}] - Additional properties
     * @param [opts.atRuleType = ''] - At-rule type, eg. `media`
     * @param [opts.atRuleParams = ''] - At-rule parameters, eg. `(min-width: 500px)`
     */
    setRule(
      selectors: string,
      style: any,
      opts?: {
        atRuleType?: string;
        atRuleParams?: string;
      }
    ): any;
    /**
     * Get the CssRule.
     * @example
     * const rule = css.getRule('.myclass1:hover');
     * const rule2 = css.getRule('.myclass1:hover, div#myid');
     * const rule3 = css.getRule('.myclass1', {
     *  atRuleType: 'media',
     *  atRuleParams: '(min-width: 500px)',
     * });
     * @param selectors - Selector string, eg. `.myclass:hover`
     * @param [opts = {}] - Additional properties
     * @param [opts.atRuleType = ''] - At-rule type, eg. `media`
     * @param [opts.atRuleParams = ''] - At-rule parameters, eg. '(min-width: 500px)'
     */
    getRule(
      selectors: string,
      opts?: {
        atRuleType?: string;
        atRuleParams?: string;
      }
    ): CssRule | undefined;
    /**
     * Get all rules or filtered by a matching selector.
     * @example
     * // Take all the component specific rules
     * const id = someComponent.getId();
     * const rules = css.getRules(`#${id}`);
     * console.log(rules.map(rule => rule.toCSS()))
     * // All rules in the project
     * console.log(css.getRules())
     * @param [selector = ''] - Selector, eg. `.myclass`
     */
    getRules(selector?: string): CssRule[];
    /**
     * Remove rule, by CssRule or matching selector (eg. the selector will match also at-rules like `@media`)
     * @example
     * // Remove by CssRule
     * const toRemove = css.getRules('.my-cls');
     * css.remove(toRemove);
     * // Remove by selector
     * css.remove('.my-cls-2');
     */
    remove(toRemove: object | string): any;
    /**
     * Remove all rules
     */
    clear(): this;
  }

  interface Styleable {
    /**
     * To trigger the style change event on models I have to
     * pass a new object instance
     * @param prop
     */
    extendStyle(prop: object): object;

    /**
     * Get style object
     */
    getStyle(prop?: string): object;

    /**
     * Set new style object
     * @return {Object} Applied properties
     */
    setStyle(prop: object | string, opts?: object): object;

    /**
     * Add style property
     * @example
     * this.addStyle({color: 'red'});
     * this.addStyle('color', 'blue');
     */
    addStyle(prop: object | string, value?: string, opts?: object): void;

    /**
     * Remove style property
     */
    removeStyle(prop: string): void;

    /**
     * Returns string of style properties
     */
    styleToString(opts?: object): string;
  }

  interface CssRuleOptions {
    /**
     * Array of selectors
     */
    selectors: Selector[];
    /**
     * Object containing style definitions
     */
    style: any;
    /**
     * Additional string css selectors
     * @defaultValue ''
     */
    selectorsAdd?: string;
    /**
     * Type of at-rule, eg. `media`, 'font-face'
     * @defaultValue ''
     */
    atRuleType?: string;
    /**
     * At-rule value, eg. `(max-width: 1000px)`
     * @defaultValue ''
     */
    mediaText?: string;
    /**
     * This property is used only on at-rules, like 'page' or 'font-face', where the block containes only style declarations
     */
    singleAtRule?: boolean;
    /**
     * State of the rule, eg: `hover`, `focused`
     * @defaultValue ''
     */
    state?: string;
    /**
     * If true, sets `!important` on all properties. You can also pass an array to specify properties on which use important
     */
    important?: boolean | String[];
    /**
       * Indicates if the rule is stylable from the editor

      [Device]: device.html
      [State]: state.html
      [Component]: component.html
       * @defaultValue true
       */
    stylable?: boolean | string[];
  }
  interface CssRule extends Backbone.Model<CssRuleOptions>, Styleable {
    /**
     * Returns the at-rule statement when exists, eg. `@media (...)`, `@keyframes`
     * @example
     * const cssRule = editor.Css.setRule('.class1', { color: 'red' }, {
     *  atRuleType: 'media',
     *  atRuleParams: '(min-width: 500px)'
     * });
     * cssRule.getAtRule(); // "@media (min-width: 500px)"
     */
    getAtRule(): string;

    /**
     * Return selectors of the rule as a string
     * @example
     * const cssRule = editor.Css.setRule('.class1:hover', { color: 'red' });
     * cssRule.selectorsToString(); // ".class1:hover"
     * cssRule.selectorsToString({ skipState: true }); // ".class1"
     * @param [opts] - Options
     * @param [opts.skipState] - Skip state from the result
     */
    selectorsToString(opts?: { skipState?: boolean }): string;

    /**
     * Get declaration block (without the at-rule statement)
     * @example
     * const cssRule = editor.Css.setRule('.class1', { color: 'red' }, {
     *  atRuleType: 'media',
     *  atRuleParams: '(min-width: 500px)'
     * });
     * cssRule.getDeclaration() // ".class1{color:red;}"
     * @param [opts = {}] - Options (same as in `selectorsToString`)
     */
    getDeclaration(opts?: any): string;

    /**
     * Get the Device the rule is related to.
     * @example
     * const device = rule.getDevice();
     * console.log(device?.getName());
     */
    getDevice(): Device | null;

    /**
     * Get the State the rule is related to.
     * @example
     * const state = rule.getState();
     * console.log(state?.getLabel());
     */
    getState(): State | null;

    /**
     * Returns the related Component (valid only for component-specific rules).
     * @example
     * const cmp = rule.getComponent();
     * console.log(cmp?.toHTML());
     */
    getComponent(): Component | null;

    /**
     * Return the CSS string of the rule
     * @example
     * const cssRule = editor.Css.setRule('.class1', { color: 'red' }, {
     *  atRuleType: 'media',
     *  atRuleParams: '(min-width: 500px)'
     * });
     * cssRule.toCSS() // "@media (min-width: 500px){.class1{color:red;}}"
     * @param [opts = {}] - Options (same as in `getDeclaration`)
     * @returns CSS string
     */
    toCSS(opts?: any): string;
  }

  /**
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/modal_dialog/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  modal: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
   *
   * ```js
   * const modal = editor.Modal;
   * ```
   *
   * ## Available Events
   * * `modal:open` - Modal is opened
   * * `modal:close` - Modal is closed
   * * `modal` - Event triggered on any change related to the modal. An object containing all the available data about the triggered event is passed as an argument to the callback.
   *
   * ## Methods
   * * [open](#open)
   * * [close](#close)
   * * [isOpen](#isopen)
   * * [setTitle](#settitle)
   * * [getTitle](#gettitle)
   * * [setContent](#setcontent)
   * * [getContent](#getcontent)
   * * [onceClose](#onceclose)
   * * [onceOpen](#onceopen)
   */
  interface Modal {
    /**
     * Open the modal window
     * @example
     * modal.open({
     *   title: 'My title',
     *   content: 'My content',
     *   attributes: { class: 'my-class' },
     * });
     * @param [opts = {}] - Options
     * @param [opts.title] - Title to set for the modal
     * @param [opts.content] - Content to set for the modal
     * @param [opts.attributes] - Updates the modal wrapper with custom attributes
     */
    open(opts?: {
      title?: string | HTMLElement;
      content?: string | HTMLElement;
      attributes?: any;
    }): this;
    /**
     * Close the modal window
     * @example
     * modal.close();
     */
    close(): this;
    /**
     * Execute callback when the modal will be closed.
     * The callback will be called one only time
     * @example
     * modal.onceClose(() => {
     *  console.log('The modal is closed');
     * });
     * @param clb - Callback to call
     */
    onceClose(clb: (...params: any[]) => any): this;
    /**
     * Execute callback when the modal will be opened.
     * The callback will be called one only time
     * @example
     * modal.onceOpen(() => {
     *  console.log('The modal is opened');
     * });
     * @param clb - Callback to call
     */
    onceOpen(clb: (...params: any[]) => any): this;
    /**
     * Checks if the modal window is open
     * @example
     * modal.isOpen(); // true | false
     */
    isOpen(): boolean;
    /**
     * Set the title to the modal window
     * @example
     * // pass a string
     * modal.setTitle('Some title');
     * // or an HTMLElement
     * const el = document.createElement('div');
     * el.innerText =  'New title';
     * modal.setTitle(el);
     * @param title - Title
     */
    setTitle(title: string | HTMLElement): this;
    /**
     * Returns the title of the modal window
     * @example
     * modal.getTitle();
     */
    getTitle(): string | HTMLElement;
    /**
     * Set the content of the modal window
     * @example
     * // pass a string
     * modal.setContent('Some content');
     * // or an HTMLElement
     * const el = document.createElement('div');
     * el.innerText =  'New content';
     * modal.setContent(el);
     * @param content - Content
     */
    setContent(content: string | HTMLElement): this;
    /**
     * Get the content of the modal window
     * @example
     * modal.getContent();
     */
    getContent(): string | HTMLElement;
    /**
     * Returns content element
     */
    getContentEl(): HTMLElement | undefined;
  }

  /**
   * This module allows to customize the built-in toolbar of the Rich Text Editor and use commands from the [HTML Editing APIs](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand).
   * It's highly recommended to keep this toolbar as small as possible, especially from styling commands (eg. 'fontSize') and leave this task to the Style Manager
   *
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/rich_text_editor/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  richTextEditor: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
   *
   * ```js
   * // Listen to events
   * editor.on('rte:enable', () => { ... });
   *
   * // Use the API
   * const rte = editor.RichTextEditor;
   * rte.add(...);
   * ```
   *
   * ## Available Events
   * * `rte:enable` - RTE enabled. The view, on which RTE is enabled, is passed as an argument
   * * `rte:disable` - RTE disabled. The view, on which RTE is disabled, is passed as an argument
   *
   * ## Methods
   * * [add](#add)
   * * [get](#get)
   * * [getAll](#getall)
   * * [remove](#remove)
   * * [getToolbarEl](#gettoolbarel)
   */
  interface RichTextEditor {
    /**
     * Add a new action to the built-in RTE toolbar
     * @example
     * rte.add('bold', {
     *   icon: '<b>B</b>',
     *   attributes: {title: 'Bold'},
     *   result: rte => rte.exec('bold')
     * });
     * rte.add('link', {
     *   icon: document.getElementById('t'),
     *   attributes: {title: 'Link',}
     *   // Example on it's easy to wrap a selected content
     *   result: rte => rte.insertHTML(`<a href="#">${rte.selection()}</a>`)
     * });
     * // An example with fontSize
     * rte.add('fontSize', {
     *   icon: `<select class="gjs-field">
     *         <option>1</option>
     *         <option>4</option>
     *         <option>7</option>
     *       </select>`,
     *     // Bind the 'result' on 'change' listener
     *   event: 'change',
     *   result: (rte, action) => rte.exec('fontSize', action.btn.firstChild.value),
     *   // Callback on any input change (mousedown, keydown, etc..)
     *   update: (rte, action) => {
     *     const value = rte.doc.queryCommandValue(action.name);
     *     if (value != 'false') { // value is a string
     *       action.btn.firstChild.value = value;
     *     }
     *    }
     *   })
     * // An example with state
     * const isValidAnchor = (rte) => {
     *   // a utility function to help determine if the selected is a valid anchor node
     *   const anchor = rte.selection().anchorNode;
     *   const parentNode  = anchor && anchor.parentNode;
     *   const nextSibling = anchor && anchor.nextSibling;
     *   return (parentNode && parentNode.nodeName == 'A') || (nextSibling && nextSibling.nodeName == 'A')
     * }
     * rte.add('toggleAnchor', {
     *   icon: `<span style="transform:rotate(45deg)">&supdsub;</span>`,
     *   state: (rte, doc) => {
     *    if (rte && rte.selection()) {
     *      // `btnState` is a integer, -1 for disabled, 0 for inactive, 1 for active
     *      return isValidAnchor(rte) ? btnState.ACTIVE : btnState.INACTIVE;
     *    } else {
     *      return btnState.INACTIVE;
     *    }
     *   },
     *   result: (rte, action) => {
     *     if (isValidAnchor(rte)) {
     *       rte.exec('unlink');
     *     } else {
     *       rte.insertHTML(`<a class="link" href="">${rte.selection()}</a>`);
     *     }
     *   }
     * })
     * @param name - Action name
     * @param action - Action options
     */
    add(name: string, action: any): void;
    /**
     * Get the action by its name
     * @example
     * const action = rte.get('bold');
     * // {name: 'bold', ...}
     * @param name - Action name
     */
    get(name: string): any;
    /**
     * Get all actions
     */
    getAll(): any[];
    /**
     * Remove the action from the toolbar
     * @example
     * const action = rte.remove('bold');
     * // {name: 'bold', ...}
     * @returns Removed action
     */
    remove(name: string): any;
    /**
     * Get the toolbar element
     */
    getToolbarEl(): HTMLElement;
  }

  /**
   * You can customize the initial state of the module from the editor initialization
   * ```js
   * const editor = grapesjs.init({
   *  keymaps: {
   *     // Object of keymaps
   *    defaults: {
   *      'your-namespace:keymap-name' {
   *        keys: '⌘+z, ctrl+z',
   *        handler: 'some-command-id'
   *      },
   *      ...
   *    }
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
   *
   * ```js
   * // Listen to events
   * editor.on('keymap:add', () => { ... });
   *
   * // Use the API
   * const keymaps = editor.Keymaps;
   * keymaps.add(...);
   * ```
   *
   * ## Available Events
   * * `keymap:add` - New keymap added. The new keyamp object is passed as an argument
   * * `keymap:remove` - Keymap removed. The removed keyamp object is passed as an argument
   * * `keymap:emit` - Some keymap emitted, in arguments you get keymapId, shortcutUsed, Event
   * * `keymap:emit:{keymapId}` - `keymapId` emitted, in arguments you get keymapId, shortcutUsed, Event
   *
   * ## Methods
   * * [getConfig](#getconfig)
   * * [add](#add)
   * * [get](#get)
   * * [getAll](#getAll)
   * * [remove](#remove)
   * * [removeAll](#removeall)
   */
  interface Keymaps {
    /**
     * Get module configurations
     * @returns Configuration object
     */
    getConfig(): any;
    /**
     * Add new keymap
     * @example
     * // 'ns' is just a custom namespace
     * keymaps.add('ns:my-keymap', '⌘+j, ⌘+u, ctrl+j, alt+u', editor => {
     *  console.log('do stuff');
     * });
     * // or
     * keymaps.add('ns:my-keymap', '⌘+s, ctrl+s', 'some-gjs-command');
     *
     * // listen to events
     * editor.on('keymap:emit', (id, shortcut, e) => {
     *  // ...
     * })
     * @param id - Keymap id
     * @param keys - Keymap keys, eg. `ctrl+a`, `⌘+z, ctrl+z`
     * @param handler - Keymap handler, might be a function
     * @param [opts = {}] - Options
     * @returns Added keymap
     *  or just a command id as a string
     */
    add(
      id: string,
      keys: string,
      handler: ((...params: any[]) => any) | string,
      opts?: any
    ): any;
    /**
     * Get the keymap by id
     * @example
     * keymaps.get('ns:my-keymap');
     * // -> {keys, handler};
     * @param id - Keymap id
     * @returns Keymap object
     */
    get(id: string): any;
    /**
     * Get all keymaps
     * @example
     * keymaps.getAll();
     * // -> {id1: {}, id2: {}};
     */
    getAll(): any;
    /**
     * Remove the keymap by id
     * @example
     * keymaps.remove('ns:my-keymap');
     * // -> {keys, handler};
     * @param id - Keymap id
     * @returns Removed keymap
     */
    remove(id: string): any;
    /**
     * Remove all binded keymaps
     */
    removeAll(): Keymaps;
  }

  /**
   * This module allows to manage the stack of changes applied in canvas.
   * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
   *
   * ```js
   * const um = editor.UndoManager;
   * ```
   *
   * * [getConfig](#getconfig)
   * * [add](#add)
   * * [remove](#remove)
   * * [removeAll](#removeall)
   * * [start](#start)
   * * [stop](#stop)
   * * [undo](#undo)
   * * [undoAll](#undoall)
   * * [redo](#redo)
   * * [redoAll](#redoall)
   * * [hasUndo](#hasundo)
   * * [hasRedo](#hasredo)
   * * [getStack](#getstack)
   * * [clear](#clear)
   */
  interface UndoManager {
    /**
     * Get module configurations
     * @example
     * const config = um.getConfig();
     * // { ... }
     * @returns Configuration object
     */
    getConfig(): any;
    /**
     * Add an entity (Model/Collection) to track
     * Note: New Components and CSSRules will be added automatically
     * @example
     * um.add(someModelOrCollection);
     * @param entity - Entity to track
     */
    add(
      entity: Backbone.GenericModel | Backbone.Collection<Backbone.GenericModel>
    ): UndoManager;
    /**
     * Remove and stop tracking the entity (Model/Collection)
     * @example
     * um.remove(someModelOrCollection);
     * @param entity - Entity to remove
     */
    remove(
      entity: Backbone.GenericModel | Backbone.Collection<Backbone.GenericModel>
    ): UndoManager;
    /**
     * Remove all entities
     * @example
     * um.removeAll();
     */
    removeAll(): UndoManager;
    /**
     * Start/resume tracking changes
     * @example
     * um.start();
     */
    start(): UndoManager;
    /**
     * Stop tracking changes
     * @example
     * um.stop();
     */
    stop(): UndoManager;
    /**
     * Undo last change
     * @example
     * um.undo();
     */
    undo(): UndoManager;
    /**
     * Undo all changes
     * @example
     * um.undoAll();
     */
    undoAll(): UndoManager;
    /**
     * Redo last change
     * @example
     * um.redo();
     */
    redo(): UndoManager;
    /**
     * Redo all changes
     * @example
     * um.redoAll();
     */
    redoAll(): UndoManager;
    /**
     * Checks if exists an available undo
     * @example
     * um.hasUndo();
     */
    hasUndo(): boolean;
    /**
     * Checks if exists an available redo
     * @example
     * um.hasRedo();
     */
    hasRedo(): boolean;
    /**
     * Check if the entity (Model/Collection) to tracked
     * Note: New Components and CSSRules will be added automatically
     * @param entity - Entity to track
     */
    isRegistered(
      entity: Backbone.GenericModel | Backbone.Collection<Backbone.GenericModel>
    ): boolean;
    /**
     * Get stack of changes
     * @example
     * const stack = um.getStack();
     * stack.each(item => ...);
     */
    getStack(): Backbone.Collection<Backbone.GenericModel>;
    /**
     * Get grouped undo manager stack.
     * The difference between `getStack` is when you do multiple operations at a time,
     * like appending multiple components:
     * `editor.getWrapper().append(`<div>C1</div><div>C2</div>`);`
     * `getStack` will return a collection length of 2.
     *  `getStackGroup` instead will group them as a single operation (the first
     * inserted component will be returned in the list) by returning an array length of 1.
     */
    getStackGroup(): any[];
    /**
     * Clear the stack
     * @example
     * um.clear();
     */
    clear(): UndoManager;
  }

  /**
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/canvas/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  canvas: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
   *
   * ```js
   * // Listen to events
   * editor.on('canvas:drop', () => { ... });
   *
   * // Use the API
   * const canvas = editor.Canvas;
   * canvas.setCoords(...);
   * ```
   * ## Available Events
   * * `canvas:dragenter` - When something is dragged inside the canvas, `DataTransfer` instance passed as an argument
   * * `canvas:dragover` - When something is dragging on canvas, `DataTransfer` instance passed as an argument
   * * `canvas:drop` - Something is dropped in canvas, `DataTransfer` instance and the dropped model are passed as arguments
   * * `canvas:dragend` - When a drag operation is ended, `DataTransfer` instance passed as an argument
   * * `canvas:dragdata` - On any dataTransfer parse, `DataTransfer` instance and the `result` are passed as arguments.
   *  By changing `result.content` you're able to customize what is dropped
   *
   * ## Methods
   * * [getConfig](#getconfig)
   * * [getElement](#getelement)
   * * [getFrameEl](#getframeel)
   * * [getWindow](#getwindow)
   * * [getDocument](#getdocument)
   * * [getBody](#getbody)
   * * [setCustomBadgeLabel](#setcustombadgelabel)
   * * [hasFocus](#hasfocus)
   * * [scrollTo](#scrollto)
   * * [setZoom](#setzoom)
   * * [getZoom](#getzoom)
   * * [getCoords](#getcoords)
   * * [setCoords](#setcoords)
   *
   * [Component]: component.html
   * [Frame]: frame.html
   */
  interface Canvas {
    /**
     * Get the configuration object
     * @example
     * console.log(canvas.getConfig())
     * @returns Configuration object
     */
    getConfig(): CanvasConfig;
    /**
     * Get the canvas element
     */
    getElement(): HTMLElement;
    /**
     * Get the main frame element of the canvas
     */
    getFrameEl(): HTMLIFrameElement;
    /**
     * Get the main frame window instance
     */
    getWindow(): Window;
    /**
     * Get the main frame document element
     */
    getDocument(): HTMLDocument;
    /**
     * Get the main frame body element
     */
    getBody(): HTMLBodyElement;
    /**
     * Set custom badge naming strategy
     * @example
     * canvas.setCustomBadgeLabel(function(component){
     *  return component.getName();
     * });
     */
    setCustomBadgeLabel(f: (...params: any[]) => any): void;
    /**
     * Get canvas rectangular data
     */
    getRect(): any;
    /**
     * Check if the canvas is focused
     */
    hasFocus(): boolean;
    /**
     * Scroll canvas to the element if it's not visible. The scrolling is
     * executed via `scrollIntoView` API and options of this method are
     * passed to it. For instance, you can scroll smoothly by using
     * `{ behavior: 'smooth' }`.
     * @example
     * const selected = editor.getSelected();
     * // Scroll smoothly (this behavior can be polyfilled)
     * canvas.scrollTo(selected, { behavior: 'smooth' });
     * // Force the scroll, even if the element is alredy visible
     * canvas.scrollTo(selected, { force: true });
     * @param [opts = {}] - Options, same as options for `scrollIntoView`
     * @param [opts.force = false] - Force the scroll, even if the element is already visible
     */
    scrollTo(
      el: HTMLElement | Component,
      opts?: {
        force?: boolean;
      }
    ): void;
    /**
     * Set canvas zoom value
     * @example
     * canvas.setZoom(50); // set zoom to 50%
     * @param value - The zoom value, from 0 to 100
     */
    setZoom(value: number): this;
    /**
     * Get canvas zoom value
     * @example
     * canvas.setZoom(50); // set zoom to 50%
     * const zoom = canvas.getZoom(); // 50
     */
    getZoom(): number;
    /**
     * Set canvas position coordinates
     * @example
     * canvas.setCoords(100, 100);
     * @param x - Horizontal position
     * @param y - Vertical position
     */
    setCoords(x: number, y: number): this;
    /**
     * Get canvas position coordinates
     * @example
     * canvas.setCoords(100, 100);
     * const coords = canvas.getCoords();
     * // { x: 100, y: 100 }
     * @returns Object containing coordinates
     */
    getCoords(): any;
    /**
     * Add new frame to the canvas
     * @example
     * canvas.addFrame({
     *   name: 'Mobile home page',
     *   x: 100, // Position in canvas
     *   y: 100,
     *   width: 500, // Frame dimensions
     *   height: 600,
     *   // device: 'DEVICE-ID',
     *   components: [
     *     '<h1 class="testh">Title frame</h1>',
     *     '<p class="testp">Paragraph frame</p>',
     *   ],
     *   styles: `
     *     .testh { color: red; }
     *     .testp { color: blue; }
     *   `,
     * });
     * @param props - Frame properties
     */
    addFrame(props: any): any;
  }

  interface FrameOptions {
    /**
     * Wrapper component definition. You can also pass an HTML string as components of the default wrapper component.
     */
    component: any | string;
    /**
     * Width of the frame. By default, the canvas width will be taken.
     * @defaultValue ''
     */
    width?: string;
    /**
     * Height of the frame. By default, the canvas height will be taken.
     * @defaultValue ''
     */
    height?: string;
    /**
     * Horizontal position of the frame in the canvas.
     */
    x?: number;
    /**
     * Vertical position of the frame in the canvas.
     */
    y?: number;
  }

  interface Frame extends Backbone.Model<FrameOptions> { }

  /**
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/i18n/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  i18n: {
   *    locale: 'en',
   *    localeFallback: 'en',
   *    messages: {
   *      it: { hello: 'Ciao', ... },
   *      ...
   *    }
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
   *
   * ```js
   * const i18n = editor.I18n;
   * ```
   *
   * ### Events
   * * `i18n:add` - New set of messages is added
   * * `i18n:update` - The set of messages is updated
   * * `i18n:locale` - Locale changed
   */
  interface I18n {
    /**
     * Get module configurations
     * @returns Configuration object
     */
    getConfig(): any;
    /**
     * Update current locale
     * @example
     * i18n.setLocale('it');
     * @param locale - Locale value
     */
    setLocale(locale: string): this;
    /**
     * Get current locale
     * @returns Current locale value
     */
    getLocale(): string;
    /**
     * Get all messages
     * @example
     * i18n.getMessages();
     * // -> { en: { hello: '...' }, ... }
     * i18n.getMessages('en');
     * // -> { hello: '...' }
     * @param [lang] - Specify the language of messages to return
     * @param [opts] - Options
     * @param [opts.debug] - Show warnings in case of missing language
     */
    getMessages(
      lang?: string,
      opts?: {
        debug?: boolean;
      }
    ): any;
    /**
     * Set new set of messages
     * @example
     * i18n.getMessages();
     * // -> { en: { msg1: 'Msg 1', msg2: 'Msg 2', } }
     * i18n.setMessages({ en: { msg2: 'Msg 2 up', msg3: 'Msg 3', } });
     * // Set replaced
     * i18n.getMessages();
     * // -> { en: { msg2: 'Msg 2 up', msg3: 'Msg 3', } }
     * @param msg - Set of messages
     */
    setMessages(msg: any): this;
    /**
     * Update messages
     * @example
     * i18n.getMessages();
     * // -> { en: { msg1: 'Msg 1', msg2: 'Msg 2', } }
     * i18n.addMessages({ en: { msg2: 'Msg 2 up', msg3: 'Msg 3', } });
     * // Set updated
     * i18n.getMessages();
     * // -> { en: { msg1: 'Msg 1', msg2: 'Msg 2 up', msg3: 'Msg 3', } }
     * @param msg - Set of messages to add
     */
    addMessages(msg: any): this;
    /**
     * Translate the locale message
     * @example
     * obj.setMessages({
     *  en: { msg: 'Msg', msg2: 'Msg {test}'},
     *  it: { msg2: 'Msg {test} it'},
     * });
     * obj.t('msg');
     * // -> outputs `Msg`
     * obj.t('msg2', { params: { test: 'hello' } });  // use params
     * // -> outputs `Msg hello`
     * obj.t('msg2', { l: 'it', params: { test: 'hello' } });  // custom local
     * // -> outputs `Msg hello it`
     * @param key - Label to translate
     * @param [opts] - Options for the translation
     * @param [opts.params] - Params for the translation
     * @param [opts.debug] - Show warnings in case of missing resources
     */
    t(
      key: string,
      opts?: {
        params?: any;
        debug?: boolean;
      }
    ): string;
  }

  /**
   * You can customize the initial state of the module from the editor initialization
   * ```js
   * const editor = grapesjs.init({
   *  ....
   *  pageManager: {
   *    pages: [
   *      {
   *        id: 'page-id',
   *        styles: `.my-class { color: red }`, // or a JSON of styles
   *        component: '<div class="my-class">My element</div>', // or a JSON of components
   *      }
   *   ]
   *  },
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
   *
   * ```js
   * const pageManager = editor.Pages;
   * ```
   *
   * ## Available Events
   * * `page:add` - Added new page. The page is passed as an argument to the callback
   * * `page:remove` - Page removed. The page is passed as an argument to the callback
   * * `page:select` - New page selected. The newly selected page and the previous one, are passed as arguments to the callback
   * * `page:update` - Page updated. The updated page and the object containing changes are passed as arguments to the callback
   * * `page` - Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback
   *
   * ## Methods
   * * [add](#add)
   * * [get](#get)
   * * [getAll](#getall)
   * * [getAllWrappers](#getallwrappers)
   * * [getMain](#getmain)
   * * [remove](#remove)
   * * [select](#select)
   * * [getSelected](#getselected)
   *
   * [Page]: page.html
   * [Component]: component.html
   */
  interface Pages {
    /**
     * Add new page
     * @example
     * const newPage = pageManager.add({
     *  id: 'new-page-id', // without an explicit ID, a random one will be created
     *  styles: `.my-class { color: red }`, // or a JSON of styles
     *  component: '<div class="my-class">My element</div>', // or a JSON of components
     * });
     * @param props - Page properties
     * @param [opts] - Options
     */
    add(props: any, opts?: any): any;
    /**
     * Remove page
     * @example
     * const removedPage = pageManager.remove('page-id');
     * // or by passing the page
     * const somePage = pageManager.get('page-id');
     * pageManager.remove(somePage);
     */
    remove(page: string | Page): any;
    /**
     * Get page by id
     * @example
     * const somePage = pageManager.get('page-id');
     * @param id - Page id
     */
    get(id: string): any;
    /**
     * Get main page (the first one available)
     * @example
     * const mainPage = pageManager.getMain();
     */
    getMain(): any;
    /**
     * Get all pages
     * @example
     * const arrayOfPages = pageManager.getAll();
     */
    getAll(): any;
    /**
     * Get wrapper components (aka body) from all pages and frames.
     * @example
     * const wrappers = pageManager.getAllWrappers();
     * // Get all `image` components from the project
     * const allImages = wrappers.map(wrp => wrp.findType('image')).flat();
     */
    getAllWrappers(): any;
    /**
     * Change the selected page. This will switch the page rendered in canvas
     * @example
     * pageManager.select('page-id');
     * // or by passing the page
     * const somePage = pageManager.get('page-id');
     * pageManager.select(somePage);
     */
    select(page: string | Page): this;
    /**
     * Get the selected page
     * @example
     * const selectedPage = pageManager.getSelected();
     */
    getSelected(): any;
  }

  interface PageOptions {
    frames: Frame[];
  }

  interface Page extends Backbone.Model<PageOptions> {
    /**
     * Get page id
     */
    getId(): string;

    /**
     * Get page name
     */
    getName(): string;

    /**
     * Update page name
     * @param value - New page name
     */
    setName(value: string): void;

    /**
     * Get all frames
     * @example
     * const arrayOfFrames = page.getAllFrames();
     */
    getAllFrames(): Frame[];

    /**
     * Get the first frame of the page (identified always as the main one)
     * @example
     * const mainFrame = page.getMainFrame();
     */
    getMainFrame(): Frame;

    /**
     * Get the root component (usually is the `wrapper` component) from the main frame
     * @example
     * const rootComponent = page.getMainComponent();
     * console.log(rootComponent.toHTML());
     */
    getMainComponent(): Component;
  }

  /**
   * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/parser/config/config.js)
   * ```js
   * const editor = grapesjs.init({
   *  parser: {
   *    // options
   *  }
   * })
   * ```
   *
   * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
   *
   * ```js
   * const { Parser } = editor;
   * ```
   * ## Available Events
   * * `parse:html` - On HTML parse, an object containing the input and the output of the parser is passed as an argument
   * * `parse:css` - On CSS parse, an object containing the input and the output of the parser is passed as an argument
   *
   * ## Methods
   * * [getConfig](#getconfig)
   * * [parseHtml](#parsehtml)
   * * [parseCss](#parsecss)
   */
  interface Parser {
    /**
     * Get the configuration object
     * @example
     * console.log(Parser.getConfig())
     * @returns Configuration object
     */
    getConfig(): any;
    /**
     * Parse HTML string and return the object containing the Component Definition
     * @example
     * const resHtml = Parser.parseHtml(`<table><div>Hi</div></table>`, {
     *   htmlType: 'text/html', // default
     * });
     * // By using the `text/html`, this will fix automatically all the HTML syntax issues
     * // Indeed the final representation, in this case, will be `<div>Hi</div><table></table>`
     * const resXml = Parser.parseHtml(`<table><div>Hi</div></table>`, {
     *   htmlType: 'application/xml',
     * });
     * // This will preserve the original format as, from the XML point of view, is a valid format
     * @param input - HTML string to parse
     * @param [options] - Options
     * @param [options.htmlType] - [HTML mime type](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#Argument02) to parse
     * @param [options.allowScripts = false] - Allow `<script>` tags
     * @param [options.allowUnsafeAttr = false] - Allow unsafe HTML attributes (eg. `on*` inline event handlers)
     * @returns Object containing the result `{ html: ..., css: ... }`
     */
    parseHtml(
      input: string,
      options?: {
        htmlType?: string;
        allowScripts?: boolean;
        allowUnsafeAttr?: boolean;
      }
    ): any;
    /**
     * Parse CSS string and return an array of valid definition objects for CSSRules
     * @example
     * const res = Parser.parseCss('.cls { color: red }');
     * // [{ ... }]
     * @param input - CSS string to parse
     * @returns Array containing the result
     */
    parseCss(input: string): object[];
  }
}

export default grapesjs;
export as namespace grapesjs;
