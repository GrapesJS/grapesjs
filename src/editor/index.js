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
 * @module Editor
 */
import defaults from './config/config';
import EditorModel from './model/Editor';
import EditorView from './view/EditorView';
import html from 'utils/html';

export default (config = {}, opts = {}) => {
  const { $ } = opts;
  let c = {
    ...defaults,
    ...config,
  };

  c.pStylePrefix = c.stylePrefix;
  let em = new EditorModel(c);
  let editorView;

  return {
    $,

    /**
     * @property {EditorModel}
     * @private
     */
    editor: em,

    modules: [],

    /**
     * Initialize editor model
     * @return {this}
     * @private
     */
    init(opts = {}) {
      em.init(this, { ...c, ...opts });

      this.modules = [
        'I18n',
        'Utils',
        'Config',
        'Commands',
        'Keymaps',
        'Modal',
        'Panels',
        'Canvas',
        'Parser',
        'CodeManager',
        'UndoManager',
        'RichTextEditor',
        ['Pages', 'PageManager'],
        'DomComponents',
        ['Components', 'DomComponents'],
        'LayerManager',
        ['Layers', 'LayerManager'],
        'CssComposer',
        ['Css', 'CssComposer'],
        'StorageManager',
        ['Storage', 'StorageManager'],
        'AssetManager',
        ['Assets', 'AssetManager'],
        'BlockManager',
        ['Blocks', 'BlockManager'],
        'TraitManager',
        ['Traits', 'TraitManager'],
        'SelectorManager',
        ['Selectors', 'SelectorManager'],
        'StyleManager',
        ['Styles', 'StyleManager'],
        'DeviceManager',
        ['Devices', 'DeviceManager'],
      ];

      this.modules.forEach(prop => {
        if (Array.isArray(prop)) {
          this[prop[0]] = em.get(prop[1]);
        } else {
          this[prop] = em.get(prop);
        }
      });

      // Do post render stuff after the iframe is loaded otherwise it'll
      // be empty during tests
      em.once('change:ready', () => {
        this.UndoManager.clear();
        em.get('modules').forEach(module => {
          module.postRender && module.postRender(editorView);
        });
      });

      return this;
    },

    /**
     * Returns configuration object
     * @param  {string} [prop] Property name
     * @returns {any} Returns the configuration object or
     *  the value of the specified property
     */
    getConfig(prop) {
      return em.getConfig(prop);
    },

    /**
     * Returns HTML built inside canvas
     * @param {Object} [opts={}] Options
     * @param {Component} [opts.component] Return the HTML of a specific Component
     * @param {Boolean} [opts.cleanId=false] Remove unnecessary IDs (eg. those created automatically)
     * @returns {string} HTML string
     */
    getHtml(opts) {
      return em.getHtml(opts);
    },

    /**
     * Returns CSS built inside canvas
     * @param {Object} [opts={}] Options
     * @param {Component} [opts.component] Return the CSS of a specific Component
     * @param {Boolean} [opts.json=false] Return an array of CssRules instead of the CSS string
     * @param {Boolean} [opts.avoidProtected=false] Don't include protected CSS
     * @param {Boolean} [opts.onlyMatched=false] Return only rules matched by the passed component.
     * @param {Boolean} [opts.keepUnusedStyles=false] Force keep all defined rules. Toggle on in case output looks different inside/outside of the editor.
     * @returns {String|Array<CssRule>} CSS string or array of CssRules
     */
    getCss(opts) {
      return em.getCss(opts);
    },

    /**
     * Returns JS of all components
     * @param {Object} [opts={}] Options
     * @param {Component} [opts.component] Get the JS of a specific component
     * @returns {String} JS string
     */
    getJs(opts) {
      return em.getJs(opts);
    },

    /**
     * Return the complete tree of components. Use `getWrapper` to include also the wrapper
     * @return {Components}
     */
    getComponents() {
      return em.get('DomComponents').getComponents();
    },

    /**
     * Return the wrapper and its all components
     * @return {Component}
     */
    getWrapper() {
      return em.get('DomComponents').getWrapper();
    },

    /**
     * Set components inside editor's canvas. This method overrides actual components
     * @param {Array<Object>|Object|string} components HTML string or components model
     * @param {Object} opt the options object to be used by the [setComponents]{@link em#setComponents} method
     * @return {this}
     * @example
     * editor.setComponents('<div class="cls">New component</div>');
     * // or
     * editor.setComponents({
     *  type: 'text',
     *   classes:['cls'],
     *   content: 'New component'
     * });
     */
    setComponents(components, opt = {}) {
      em.setComponents(components, opt);
      return this;
    },

    /**
     * Add components
     * @param {Array<Object>|Object|string} components HTML string or components model
     * @param {Object} opts Options
     * @param {Boolean} [opts.avoidUpdateStyle=false] If the HTML string contains styles,
     * by default, they will be created and, if already exist, updated. When this option
     * is true, styles already created will not be updated.
     * @return {Array<Component>}
     * @example
     * editor.addComponents('<div class="cls">New component</div>');
     * // or
     * editor.addComponents({
     *  type: 'text',
     *   classes:['cls'],
     *   content: 'New component'
     * });
     */
    addComponents(components, opts) {
      return this.getWrapper().append(components, opts);
    },

    /**
     * Returns style in JSON format object
     * @return {Object}
     */
    getStyle() {
      return em.get('CssComposer').getAll();
    },

    /**
     * Set style inside editor's canvas. This method overrides actual style
     * @param {Array<Object>|Object|string} style CSS string or style model
     * @return {this}
     * @example
     * editor.setStyle('.cls{color: red}');
     * //or
     * editor.setStyle({
     *   selectors: ['cls'],
     *   style: { color: 'red' }
     * });
     */
    setStyle(style, opt = {}) {
      em.setStyle(style, opt);
      return this;
    },

    /**
     * Add styles to the editor
     * @param {Array<Object>|Object|string} style CSS string or style model
     * @returns {Array<CssRule>} Array of created CssRule instances
     * @example
     * editor.addStyle('.cls{color: red}');
     */
    addStyle(style, opts = {}) {
      return em.addStyle(style, opts);
    },

    /**
     * Returns the last selected component, if there is one
     * @return {Model}
     */
    getSelected() {
      return em.getSelected();
    },

    /**
     * Returns an array of all selected components
     * @return {Array}
     */
    getSelectedAll() {
      return em.getSelectedAll();
    },

    /**
     * Get a stylable entity from the selected component.
     * If you select a component without classes the entity is the Component
     * itself and all changes will go inside its 'style' attribute. Otherwise,
     * if the selected component has one or more classes, the function will
     * return the corresponding CSS Rule
     * @return {Model}
     */
    getSelectedToStyle() {
      let selected = em.getSelected();

      if (selected) {
        return this.StyleManager.getModelToStyle(selected);
      }
    },

    /**
     * Select a component
     * @param  {Component|HTMLElement} el Component to select
     * @param  {Object} [opts] Options
     * @param  {Boolean} [opts.scroll] Scroll canvas to the selected element
     * @return {this}
     * @example
     * // Select dropped block
     * editor.on('block:drag:stop', function(model) {
     *  editor.select(model);
     * });
     */
    select(el, opts) {
      em.setSelected(el, opts);
      return this;
    },

    /**
     * Add component to selection
     * @param  {Component|HTMLElement|Array} el Component to select
     * @return {this}
     * @example
     * editor.selectAdd(model);
     */
    selectAdd(el) {
      em.addSelected(el);
      return this;
    },

    /**
     * Remove component from selection
     * @param  {Component|HTMLElement|Array} el Component to select
     * @return {this}
     * @example
     * editor.selectRemove(model);
     */
    selectRemove(el) {
      em.removeSelected(el);
      return this;
    },

    /**
     * Toggle component selection
     * @param  {Component|HTMLElement|Array} el Component to select
     * @return {this}
     * @example
     * editor.selectToggle(model);
     */
    selectToggle(el) {
      em.toggleSelected(el);
      return this;
    },

    /**
     * Returns, if active, the Component enabled in rich text editing mode.
     * @returns {Component|null}
     * @example
     * const textComp = editor.getEditing();
     * if (textComp) {
     *  console.log('HTML: ', textComp.toHTML());
     * }
     */
    getEditing() {
      return em.getEditing();
    },

    /**
     * Set device to the editor. If the device exists it will
     * change the canvas to the proper width
     * @param {string} name Name of the device
     * @return {this}
     * @example
     * editor.setDevice('Tablet');
     */
    setDevice(name) {
      em.set('device', name);
      return this;
    },

    /**
     * Return the actual active device
     * @return {string} Device name
     * @example
     * var device = editor.getDevice();
     * console.log(device);
     * // 'Tablet'
     */
    getDevice() {
      return em.get('device');
    },

    /**
     * Execute command
     * @param {string} id Command ID
     * @param {Object} options Custom options
     * @return {*} The return is defined by the command
     * @example
     * editor.runCommand('myCommand', {someValue: 1});
     */
    runCommand(id, options = {}) {
      return em.get('Commands').run(id, options);
    },

    /**
     * Stop the command if stop method was provided
     * @param {string} id Command ID
     * @param {Object} options Custom options
     * @return {*} The return is defined by the command
     * @example
     * editor.stopCommand('myCommand', {someValue: 1});
     */
    stopCommand(id, options = {}) {
      return em.get('Commands').stop(id, options);
    },

    /**
     * Store data to the current storage
     * @param {Function} clb Callback function
     * @return {Object} Stored data
     */
    store(clb) {
      return em.store(clb);
    },

    /**
     * Get the JSON project data, which could be stored and loaded back with `editor.loadProject(json)`
     * @returns {Object}
     * @example
     * @private
     * console.log(editor.getProject());
     * // { pages: [...], styles: [...], ... }
     */
    getProject() {
      return em.storeData();
    },

    /**
     * Get the JSON data object, which could be stored and loaded back with `editor.loadData(json)`
     * @returns {Object}
     * @example
     * console.log(editor.storeData());
     * // { pages: [...], styles: [...], ... }
     */
    storeData() {
      return em.storeData();
    },

    /**
     * Load data from the current storage
     * @param {Function} clb Callback function
     * @return {Object} Stored data
     */
    load(clb) {
      return em.load(clb);
    },

    /**
     * Load data from the JSON project
     * @param {Object} data Project to load
     * @example
     * @private
     * editor.loadProject({ pages: [...], styles: [...], ... })
     */
    loadProject(data) {
      return em.loadData(data);
    },

    /**
     * Load data from the JSON data object
     * @param {Object} data Data to load
     * @return {Object} Loaded object
     * @example
     * editor.loadData({ pages: [...], styles: [...], ... })
     */
    loadData(data) {
      return em.loadData(data);
    },

    /**
     * Returns container element. The one which was indicated as 'container'
     * on init method
     * @return {HTMLElement}
     */
    getContainer() {
      return c.el;
    },

    /**
     * Return the count of changes made to the content and not yet stored.
     * This count resets at any `store()`
     * @return {number}
     */
    getDirtyCount() {
      return em.getDirtyCount();
    },

    /**
     * Update editor dimension offsets
     *
     * This method could be useful when you update, for example, some position
     * of the editor element (eg. canvas, panels, etc.) with CSS, where without
     * refresh you'll get misleading position of tools
     * @param {Object} [options] Options
     * @param {Boolean} [options.tools=false] Update the position of tools (eg. rich text editor, component highlighter, etc.)
     */
    refresh(opts) {
      em.refreshCanvas(opts);
    },

    /**
     * Replace the built-in Rich Text Editor with a custom one.
     * @param {Object} obj Custom RTE Interface
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
     */
    setCustomRte(obj) {
      this.RichTextEditor.customRte = obj;
    },

    /**
     * Replace the default CSS parser with a custom one.
     * The parser function receives a CSS string as a parameter and expects
     * an array of CSSRule objects as a result. If you need to remove the
     * custom parser, pass `null` as the argument
     * @param {Function|null} parser Parser function
     * @return {this}
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
     */
    setCustomParserCss(parser) {
      this.Parser.getConfig().parserCss = parser;
      return this;
    },

    /**
     * Change the global drag mode of components.
     * To get more about this feature read: https://github.com/artf/grapesjs/issues/1936
     * @param {String} value Drag mode, options: 'absolute' | 'translate'
     * @returns {this}
     */
    setDragMode(value) {
      em.setDragMode(value);
      return this;
    },

    /**
     * Trigger event log message
     * @param  {*} msg Message to log
     * @param  {Object} [opts={}] Custom options
     * @param  {String} [opts.ns=''] Namespace of the log (eg. to use in plugins)
     * @param  {String} [opts.level='debug'] Level of the log, `debug`, `info`, `warning`, `error`
     * @return {this}
     * @example
     * editor.log('Something done!', { ns: 'from-plugin-x', level: 'info' });
     * // This will trigger following events
     * // `log`, `log:info`, `log-from-plugin-x`, `log-from-plugin-x:info`
     * // Callbacks of those events will always receive the message and
     * // options, as arguments, eg:
     * // editor.on('log:info', (msg, opts) => console.info(msg, opts))
     */
    log(msg, opts = {}) {
      em.log(msg, opts);
      return this;
    },

    /**
     * Translate label
     * @param {String} key Label to translate
     * @param {Object} [opts] Options for the translation
     * @param {Object} [opts.params] Params for the translation
     * @param {Boolean} [opts.noWarn] Avoid warnings in case of missing resources
     * @returns {String}
     * @example
     * editor.t('msg');
     * // use params
     * editor.t('msg2', { params: { test: 'hello' } });
     * // custom local
     * editor.t('msg2', { params: { test: 'hello' }, l: 'it' });
     */
    t(...args) {
      return em.t(...args);
    },

    /**
     * Attach event
     * @param  {string} event Event name
     * @param  {Function} callback Callback function
     * @return {this}
     */
    on(event, callback) {
      em.on(event, callback);
      return this;
    },

    /**
     * Attach event and detach it after the first run
     * @param  {string} event Event name
     * @param  {Function} callback Callback function
     * @return {this}
     */
    once(event, callback) {
      em.once(event, callback);
      return this;
    },

    /**
     * Detach event
     * @param  {string} event Event name
     * @param  {Function} callback Callback function
     * @return {this}
     */
    off(event, callback) {
      em.off(event, callback);
      return this;
    },

    /**
     * Trigger event
     * @param  {string} event Event to trigger
     * @return {this}
     */
    trigger(event) {
      em.trigger.apply(em, arguments);
      return this;
    },

    /**
     * Destroy the editor
     */
    destroy() {
      if (!em) return;
      em.destroyAll();
      this.modules.forEach(prop => {
        if (Array.isArray(prop)) {
          this[prop[0]] = 0;
        } else {
          this[prop] = 0;
        }
      });
      this.modules = 0;
      editorView = 0;
      em = 0;
      c = 0;
    },

    /**
     * Returns editor element
     * @return {HTMLElement}
     * @private
     */
    getEl() {
      return editorView && editorView.el;
    },

    /**
     * Returns editor model
     * @return {Model}
     * @private
     */
    getModel() {
      return em;
    },

    /**
     * Render editor
     * @return {HTMLElement}
     */
    render() {
      editorView && editorView.remove();
      editorView = new EditorView({
        model: em,
        config: c,
      });
      return editorView.render().el;
    },

    /**
     * Trigger a callback once the editor is loaded and rendered.
     * The callback will be executed immediately if the method is called on the already rendered editor.
     * @param  {Function} clb Callback to trigger
     * @example
     * editor.onReady(() => {
     *   // perform actions
     * });
     */
    onReady(clb) {
      em.get('ready') ? clb(this) : em.on('load', clb);
    },

    /**
     * Print safe HTML by using ES6 tagged template strings.
     * @param {Array<String>} literals
     * @param  {Array<String>} substs
     * @returns {String}
     * @example
     * const unsafeStr = '<script>....</script>';
     * const safeStr = '<b>Hello</b>';
     * // Use `$${var}` to avoid escaping
     * const strHtml = editor.html`Escaped ${unsafeStr}, unescaped $${safeStr}`;
     */
    html,
  };
};
