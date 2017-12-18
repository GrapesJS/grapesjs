/**
 * Editor class contains the top level API which you'll probably use to custom the editor or extend it with plugins.
 * You get the Editor instance on init method
 *
 * ```js
 * var editor = grapesjs.init({...});
 * ```
 *
 * # Available Events
 *
 * ## Components
 * * `component:add` - Triggered when a new component is added to the editor, the model is passed as an argument to the callback
 * * `component:update` - Triggered when a component is updated (moved, styled, etc.), the model is passed as an argument to the callback
 * * `component:update:{propertyName}` - Listen any property change, the model is passed as an argument to the callback
 * * `component:styleUpdate` - Triggered when the style of the component is updated, the model is passed as an argument to the callback
 * * `component:styleUpdate:{propertyName}` - Listen for a specific style property change, the model is passed as an argument to the callback
 * * `component:selected` - New component selected, the selected model is passed as an argument to the callback
 * ## Blocks
 * * `block:add` - New block added
 * * `block:remove` - Block removed
 * * `block:drag:start` - Started dragging new block, Event object is passed as an argument
 * * `block:drag:stop` - Block dropped inside canvas, the new model is passed as an argument to the callback
 * ## Assets
 * * `asset:add` - New asset added
 * * `asset:remove` - Asset removed
 * * `asset:upload:start` - Before the upload is started
 * * `asset:upload:end` - After the upload is ended
 * * `asset:upload:error` - On any error in upload, passes the error as an argument
 * * `asset:upload:response` - On upload response, passes the result as an argument
 * ## Keymaps
 * * `keymap:add` - New keymap added. The new keyamp object is passed as an argument
 * * `keymap:remove` - Keymap removed. The removed keyamp object is passed as an argument
 * * `keymap:emit` - Some keymap emitted, in arguments you get keymapId, shortcutUsed, Event
 * * `keymap:emit:{keymapId}` - `keymapId` emitted, in arguments you get keymapId, shortcutUsed, Event
 * ## Style Manager
 * * `styleManager:change` - Triggered on style property change from new selected component, the view of the property is passed as an argument to the callback
 * * `styleManager:change:{propertyName}` - As above but for a specific style property
 * ## Storages
 * * `storage:start` - Before the storage request is started
 * * `storage:load` - Triggered when something was loaded from the storage, loaded object passed as an argumnet
 * * `storage:store` - Triggered when something is stored to the storage, stored object passed as an argumnet
 * * `storage:end` - After the storage request is ended
 * * `storage:error` - On any error on storage request, passes the error as an argument
 * ## Selectors
 * * `selector:add` - Triggers when a new selector/class is created
 * ## RTE
 * * `rte:enable` - RTE enabled. The view, on which RTE is enabled, is passed as an argument
 * * `rte:disable` - RTE disabled. The view, on which RTE is disabled, is passed as an argument
 * ## Commands
 * * `run:{commandName}` - Triggered when some command is called to run (eg. editor.runCommand('preview'))
 * * `stop:{commandName}` - Triggered when some command is called to stop (eg. editor.stopCommand('preview'))
 * ## General
 * * `canvasScroll` - Triggered when the canvas is scrolle
 * * `undo` - Undo executed
 * * `redo` - Redo executed
 * * `load` - When the editor is loaded
 *
 * @param {Object} config Configurations
 * @param {string} config.container='' Selector for the editor container, eg. '#myEditor'
 * @param {string|Array<Object>} [config.components=''] HTML string or object of components
 * @param {string|Array<Object>} [config.style=''] CSS string or object of rules
 * @param {Boolean} [config.fromElement=false] If true, will fetch HTML and CSS from selected container
 * @param {Boolean} [config.undoManager=true] Enable/Disable undo manager
 * @param {Boolean} [config.autorender=true] If true renders editor on init
 * @param {Boolean} [config.noticeOnUnload=true] Enable/Disable alert message before unload the page
 * @param {string} [config.height='900px'] Height for the editor container
 * @param {string} [config.width='100%'] Width for the editor container
 * @param {Object} [config.storage={}] Storage manager configuration, see the relative documentation
 * @param {Object} [config.styleManager={}] Style manager configuration, see the relative documentation
 * @param {Object} [config.commands={}] Commands configuration, see the relative documentation
 * @param {Object} [config.domComponents={}] Components configuration, see the relative documentation
 * @param {Object} [config.panels={}] Panels configuration, see the relative documentation
 * @param {Object} [config.showDevices=true] If true render a select of available devices inside style manager panel
 * @param {string} [config.defaultCommand='select-comp'] Command to execute when no other command is running
 * @param {Array} [config.plugins=[]] Array of plugins to execute on start
 * @param {Object} [config.pluginsOpts={}] Custom options for plugins
 * @example
 * var editor = grapesjs.init({
 *   container : '#gjs',
 *   components: '<div class="txt-red">Hello world!</div>',
 *   style: '.txt-red{color: red}',
 * });
 */
import $ from 'cash-dom';

module.exports = config => {
  var c = config || {},
  defaults = require('./config/config'),
  EditorModel = require('./model/Editor'),
  EditorView = require('./view/EditorView');

  for (var name in defaults) {
    if (!(name in c))
      c[name] = defaults[name];
  }

  c.pStylePrefix = c.stylePrefix;
  var em = new EditorModel(c);
  var editorView = new EditorView({
      model: em,
      config: c,
  });

  return {

    $,

    /**
     * @property {EditorModel}
     * @private
     */
    editor: em,

    /**
     * @property {DomComponents}
     * @private
     */
    DomComponents: em.get('DomComponents'),

    /**
     * @property {CssComposer}
     * @private
     */
    CssComposer: em.get('CssComposer'),

    /**
     * @property {StorageManager}
     * @private
     */
    StorageManager: em.get('StorageManager'),

    /**
     * @property {AssetManager}
     */
    AssetManager: em.get('AssetManager'),

    /**
     * @property {BlockManager}
     * @private
     */
    BlockManager: em.get('BlockManager'),

    /**
     * @property {TraitManager}
     * @private
     */
    TraitManager: em.get('TraitManager'),

    /**
     * @property {SelectorManager}
     * @private
     */
    SelectorManager: em.get('SelectorManager'),

    /**
     * @property {CodeManager}
     * @private
     */
    CodeManager: em.get('CodeManager'),

    /**
     * @property {Commands}
     * @private
     */
    Commands: em.get('Commands'),

    /**
     * @property {Keymaps}
     * @private
     */
    Keymaps: em.get('Keymaps'),

    /**
     * @property {Modal}
     * @private
     */
    Modal: em.get('Modal'),

    /**
     * @property {Panels}
     * @private
     */
    Panels: em.get('Panels'),

    /**
     * @property {StyleManager}
     * @private
     */
    StyleManager: em.get('StyleManager'),

    /**
     * @property {Canvas}
     * @private
     */
    Canvas: em.get('Canvas'),

    /**
     * @property {UndoManager}
     * @private
     */
    UndoManager: em.get('UndoManager'),

    /**
     * @property {DeviceManager}
     * @private
     */
    DeviceManager: em.get('DeviceManager'),

    /**
     * @property {RichTextEditor}
     * @private
     */
    RichTextEditor: em.get('RichTextEditor'),

    /**
     * @property {Utils}
     * @private
     */
    Utils: em.get('Utils'),

    /**
     * @property {Utils}
     * @private
     */
    Config: em.get('Config'),

    /**
     * Initialize editor model
     * @return {this}
     * @private
     */
    init() {
      em.init(this);
      return this;
    },

    /**
     * Returns configuration object
     * @param  {string} [prop] Property name
     * @return {any} Returns the configuration object or
     *  the value of the specified property
     */
    getConfig(prop) {
      return em.getConfig(prop);
    },

    /**
     * Returns HTML built inside canvas
     * @return {string} HTML string
     */
    getHtml(opts) {
      return em.getHtml(opts);
    },

    /**
     * Returns CSS built inside canvas
     * @param {Object} [opts={}] Options
     * @return {string} CSS string
     */
    getCss(opts) {
      return em.getCss(opts);
    },

    /**
     * Returns JS of all components
     * @return {string} JS string
     */
    getJs() {
      return em.getJs();
    },

    /**
     * Returns components in JSON format object
     * @return {Object}
     */
    getComponents() {
      return em.get('DomComponents').getComponents();
    },

    /**
     * Set components inside editor's canvas. This method overrides actual components
     * @param {Array<Object>|Object|string} components HTML string or components model
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
    setComponents(components) {
      em.setComponents(components);
      return this;
    },

    /**
     * Add components
     * @param {Array<Object>|Object|string} components HTML string or components model
     * @param {Object} opts Options
     * @param {Boolean} [opts.avoidUpdateStyle=false] If the HTML string contains styles,
     * by default, they will be created and, if already exist, updated. When this option
     * is true, styles already created will not be updated.
     * @return {Model|Array<Model>}
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
      return this.getComponents().add(components, opts);
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
     *   selectors: ['cls']
     *   style: { color: 'red' }
     * });
     */
    setStyle(style) {
      em.setStyle(style);
      return this;
    },

    /**
     * Returns selected component, if there is one
     * @return {Model}
     */
    getSelected() {
      return em.getSelected();
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
     * @return {this}
     * @example
     * // Select dropped block
     * editor.on('block:drag:stop', function(model) {
     *  editor.select(model);
     * });
     */
    select(el) {
      em.setSelected(el);
      return this;
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
    runCommand(id, options) {
      var result;
      var command = em.get('Commands').get(id);

      if(command){
        result = command.run(this, this, options);
        this.trigger('run:' + id);
      }
      return result;
    },

    /**
     * Stop the command if stop method was provided
     * @param {string} id Command ID
     * @param {Object} options Custom options
     * @return {*} The return is defined by the command
     * @example
     * editor.stopCommand('myCommand', {someValue: 1});
     */
    stopCommand(id, options) {
      var result;
      var command = em.get('Commands').get(id);

      if(command){
        result = command.stop(this, this, options);
        this.trigger('stop:' + id);
      }
      return result;
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
     * Load data from the current storage
     * @param {Function} clb Callback function
     * @return {Object} Stored data
     */
    load(clb) {
      return em.load(clb);
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
     * Update editor dimensions and refresh data useful for positioning of tools
     *
     * This method could be useful when you update, for example, some position
     * of the editor element (eg. canvas, panels, etc.) with CSS, where without
     * refresh you'll get misleading position of tools (eg. rich text editor,
     * component highlighter, etc.)
     *
     * @private
     */
    refresh() {
      em.refreshCanvas();
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
     * Attach event
     * @param  {string} event Event name
     * @param  {Function} callback Callback function
     * @return {this}
     */
    on(event, callback) {
      return em.on(event, callback);
    },

    /**
     * Detach event
     * @param  {string} event Event name
     * @param  {Function} callback Callback function
     * @return {this}
     */
    off(event, callback) {
      return em.off(event, callback);
    },

    /**
     * Trigger event
     * @param  {string} event Event to trigger
     * @return {this}
     */
    trigger(event) {
      return em.trigger.apply(em, arguments);
    },

    /**
     * Returns editor element
     * @return {HTMLElement}
     * @private
     */
    getEl() {
      return editorView.el;
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
      // Do post render stuff after the iframe is loaded otherwise it'll
      // be empty during tests
      em.on('loaded', () => {
        this.UndoManager.clear();
        em.get('modules').forEach(module => {
          module.postRender && module.postRender(editorView);
        });
      });

      editorView.render();
      return editorView.el;
    },

  };

};
