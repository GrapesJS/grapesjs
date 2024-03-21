/**
 * Editor contains the top level API which you'll probably use to customize the editor or extend it with plugins.
 * You get the Editor instance on init method and you can pass options via its [Configuration Object](https://github.com/GrapesJS/grapesjs/blob/master/src/editor/config/config.ts)
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
 * @module docsjs.Editor
 */
import { IBaseModule } from '../abstract/Module';
import AssetManager from '../asset_manager';
import { AssetEvent } from '../asset_manager/types';
import BlockManager, { BlockEvent } from '../block_manager';
import CanvasModule, { CanvasEvent } from '../canvas';
import CodeManagerModule from '../code_manager';
import CommandsModule, { CommandEvent } from '../commands';
import { AddOptions, EventHandler, LiteralUnion } from '../common';
import CssComposer from '../css_composer';
import CssRule from '../css_composer/model/CssRule';
import CssRules from '../css_composer/model/CssRules';
import DeviceManager from '../device_manager';
import ComponentManager, { ComponentEvent } from '../dom_components';
import Component from '../dom_components/model/Component';
import Components from '../dom_components/model/Components';
import ComponentWrapper from '../dom_components/model/ComponentWrapper';
import { ComponentAdd, DragMode } from '../dom_components/model/types';
import I18nModule from '../i18n';
import KeymapsModule, { KeymapEvent } from '../keymaps';
import ModalModule, { ModalEvent } from '../modal_dialog';
import LayerManager from '../navigator';
import PageManager from '../pages';
import PanelManager from '../panels';
import ParserModule from '../parser';
import { CustomParserCss } from '../parser/config/config';
import RichTextEditorModule, { RichTextEditorEvent } from '../rich_text_editor';
import { CustomRTE } from '../rich_text_editor/config/config';
import SelectorManager, { SelectorEvent } from '../selector_manager';
import StorageManager, { StorageEvent, StorageOptions, ProjectData } from '../storage_manager';
import StyleManager, { StyleManagerEvent } from '../style_manager';
import TraitManager from '../trait_manager';
import UndoManagerModule from '../undo_manager';
import UtilsModule from '../utils';
import html from '../utils/html';
import defaults, { EditorConfig, EditorConfigKeys } from './config/config';
import EditorModel, { EditorLoadOptions } from './model/Editor';
import EditorView from './view/EditorView';

export type ParsedRule = {
  selectors: string;
  style: Record<string, string>;
  atRule?: string;
  params?: string;
};

type GeneralEvent = 'canvasScroll' | 'undo' | 'redo' | 'load' | 'update';

type EditorBuiltInEvents =
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

type EditorEvent = LiteralUnion<EditorBuiltInEvents, string>;

type EditorConfigType = EditorConfig & { pStylePrefix?: string };

type EditorModelParam<T extends keyof EditorModel, N extends number> = Parameters<EditorModel[T]>[N];

export type EditorParam<T extends keyof Editor, N extends number> = Parameters<Editor[T]>[N];

export default class Editor implements IBaseModule<EditorConfig> {
  editorView?: EditorView;
  editor: EditorModel;
  $: any;
  em: EditorModel;
  config: EditorConfigType;

  constructor(config: EditorConfig = {}, opts: any = {}) {
    this.config = {
      ...defaults,
      ...config,
      pStylePrefix: config.stylePrefix ?? defaults.stylePrefix,
    };
    this.em = new EditorModel(this.config);
    this.$ = opts.$;
    this.em.init(this);
    this.editor = this.em;
  }

  get Config() {
    return this.em.config;
  }
  get I18n(): I18nModule {
    return this.em.I18n;
  }
  get Utils(): UtilsModule {
    return this.em.Utils;
  }
  get Commands(): CommandsModule {
    return this.em.Commands;
  }
  get Keymaps(): KeymapsModule {
    return this.em.Keymaps;
  }
  get Modal(): ModalModule {
    return this.em.Modal;
  }
  get Panels(): PanelManager {
    return this.em.Panels;
  }
  get Canvas(): CanvasModule {
    return this.em.Canvas;
  }
  get Parser(): ParserModule {
    return this.em.Parser;
  }
  get CodeManager(): CodeManagerModule {
    return this.em.CodeManager;
  }
  get UndoManager(): UndoManagerModule {
    return this.em.UndoManager;
  }
  get RichTextEditor(): RichTextEditorModule {
    return this.em.RichTextEditor;
  }
  get Pages(): PageManager {
    return this.em.Pages;
  }
  get Components(): ComponentManager {
    return this.em.Components;
  }
  get DomComponents(): ComponentManager {
    return this.em.Components;
  }
  get Layers(): LayerManager {
    return this.em.Layers;
  }
  get LayerManager(): LayerManager {
    return this.em.Layers;
  }
  get Css(): CssComposer {
    return this.em.Css;
  }
  get CssComposer(): CssComposer {
    return this.em.Css;
  }
  get Storage(): StorageManager {
    return this.em.Storage;
  }
  get StorageManager(): StorageManager {
    return this.em.Storage;
  }
  get Assets(): AssetManager {
    return this.em.Assets;
  }
  get AssetManager(): AssetManager {
    return this.em.Assets;
  }
  get Blocks(): BlockManager {
    return this.em.Blocks;
  }
  get BlockManager(): BlockManager {
    return this.em.Blocks;
  }
  get Traits(): TraitManager {
    return this.em.Traits;
  }
  get TraitManager(): TraitManager {
    return this.em.Traits;
  }
  get Selectors(): SelectorManager {
    return this.em.Selectors;
  }
  get SelectorManager(): SelectorManager {
    return this.em.Selectors;
  }
  get Styles(): StyleManager {
    return this.em.Styles;
  }
  get StyleManager(): StyleManager {
    return this.em.Styles;
  }
  get Devices(): DeviceManager {
    return this.em.Devices;
  }
  get DeviceManager(): DeviceManager {
    return this.em.Devices;
  }

  get EditorModel() {
    return this.em;
  }

  /**
   * Returns configuration object
   * @returns {any} Returns the configuration object or the value of the specified property
   */
  getConfig<
    P extends EditorConfigKeys | undefined = undefined,
    R = P extends EditorConfigKeys ? EditorConfig[P] : EditorConfig
  >(prop?: P): R {
    return this.em.getConfig(prop);
  }

  /**
   * Returns HTML built inside canvas
   * @param {Object} [opts={}] Options
   * @param {Component} [opts.component] Return the HTML of a specific Component
   * @param {Boolean} [opts.cleanId=false] Remove unnecessary IDs (eg. those created automatically)
   * @returns {string} HTML string
   */
  getHtml(opts?: EditorModelParam<'getHtml', 0>) {
    return this.em.getHtml(opts);
  }

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
  getCss(opts?: EditorModelParam<'getCss', 0>) {
    return this.em.getCss(opts);
  }

  /**
   * Returns JS of all components
   * @param {Object} [opts={}] Options
   * @param {Component} [opts.component] Get the JS of a specific component
   * @returns {String} JS string
   */
  getJs(opts?: EditorModelParam<'getJs', 0>) {
    return this.em.getJs(opts);
  }

  /**
   * Return the complete tree of components. Use `getWrapper` to include also the wrapper
   * @return {Components}
   */
  getComponents(): Components {
    return this.Components.getComponents();
  }

  /**
   * Return the wrapper and its all components
   * @return {Component}
   */
  getWrapper(): ComponentWrapper | undefined {
    return this.Components.getWrapper();
  }

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
  setComponents(components: ComponentAdd, opt: AddOptions = {}) {
    this.em.setComponents(components, opt);
    return this;
  }

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
  addComponents(components: ComponentAdd, opts?: AddOptions): Component[] {
    return this.getWrapper()!.append(components, opts);
  }

  /**
   * Returns style in JSON format object
   * @return {Object}
   */
  getStyle(): CssRules {
    return this.em.Css.getAll();
  }

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
  setStyle(style: any, opt: any = {}) {
    this.em.setStyle(style, opt);
    return this;
  }

  /**
   * Add styles to the editor
   * @param {Array<Object>|Object|string} style CSS string or style model
   * @returns {Array<CssRule>} Array of created CssRule instances
   * @example
   * editor.addStyle('.cls{color: red}');
   */
  addStyle(style: any, opts = {}): CssRule[] {
    return this.em.addStyle(style, opts);
  }

  /**
   * Returns the last selected component, if there is one
   * @return {Model}
   */
  getSelected() {
    return this.em.getSelected();
  }

  /**
   * Returns an array of all selected components
   * @return {Array}
   */
  getSelectedAll() {
    return this.em.getSelectedAll();
  }

  /**
   * Get a stylable entity from the selected component.
   * If you select a component without classes the entity is the Component
   * itself and all changes will go inside its 'style' attribute. Otherwise,
   * if the selected component has one or more classes, the function will
   * return the corresponding CSS Rule
   * @return {Model}
   */
  getSelectedToStyle() {
    let selected = this.em.getSelected();

    if (selected) {
      return this.StyleManager.getModelToStyle(selected);
    }
  }

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
  select(el?: EditorModelParam<'setSelected', 0>, opts?: { scroll?: boolean }) {
    this.em.setSelected(el, opts);
    return this;
  }

  /**
   * Add component to selection
   * @param  {Component|HTMLElement|Array} el Component to select
   * @return {this}
   * @example
   * editor.selectAdd(model);
   */
  // selectAdd(el: Parameters<EditorModel['addSelected']>[0]) {
  selectAdd(el: EditorModelParam<'addSelected', 0>) {
    this.em.addSelected(el);
    return this;
  }

  /**
   * Remove component from selection
   * @param  {Component|HTMLElement|Array} el Component to select
   * @return {this}
   * @example
   * editor.selectRemove(model);
   */
  selectRemove(el: EditorModelParam<'removeSelected', 0>) {
    this.em.removeSelected(el);
    return this;
  }

  /**
   * Toggle component selection
   * @param  {Component|HTMLElement|Array} el Component to select
   * @return {this}
   * @example
   * editor.selectToggle(model);
   */
  selectToggle(el: EditorModelParam<'toggleSelected', 0>) {
    this.em.toggleSelected(el);
    return this;
  }

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
    return this.em.getEditing();
  }

  /**
   * Set device to the editor. If the device exists it will
   * change the canvas to the proper width
   * @param {string} name Name of the device
   * @return {this}
   * @example
   * editor.setDevice('Tablet');
   */
  setDevice(name: string) {
    this.em.set('device', name);
    return this;
  }

  /**
   * Return the actual active device
   * @return {string} Device name
   * @example
   * var device = editor.getDevice();
   * console.log(device);
   * // 'Tablet'
   */
  getDevice(): string {
    return this.em.get('device');
  }

  /**
   * Execute command
   * @param {string} id Command ID
   * @param {Object} options Custom options
   * @return {*} The return is defined by the command
   * @example
   * editor.runCommand('myCommand', {someValue: 1});
   */
  runCommand(id: string, options: Record<string, unknown> = {}) {
    return this.Commands.run(id, options);
  }

  /**
   * Stop the command if stop method was provided
   * @param {string} id Command ID
   * @param {Object} options Custom options
   * @return {*} The return is defined by the command
   * @example
   * editor.stopCommand('myCommand', {someValue: 1});
   */
  stopCommand(id: string, options: Record<string, unknown> = {}) {
    return this.Commands.stop(id, options);
  }

  /**
   * Store data to the current storage.
   * This will reset the counter of changes (`editor.getDirtyCount()`).
   * @param {Object} [options] Storage options.
   * @returns {Object} Stored data.
   * @example
   * const storedData = await editor.store();
   */
  async store<T extends StorageOptions>(options?: T) {
    return await this.em.store(options);
  }

  /**
   * Load data from the current storage.
   * @param {Object} [options] Storage options.
   * @param {Object} [loadOptions={}] Load options.
   * @param {Boolean} [loadOptions.clear=false] Clear the editor state (eg. dirty counter, undo manager, etc.).
   * @returns {Object} Loaded data.
   * @example
   * const data = await editor.load();
   */
  async load<T extends StorageOptions>(options?: T, loadOptions: EditorLoadOptions = {}) {
    return await this.em.load(options, loadOptions);
  }

  /**
   * Get the JSON project data, which could be stored and loaded back with `editor.loadProjectData(json)`
   * @returns {Object}
   * @example
   * console.log(editor.getProjectData());
   * // { pages: [...], styles: [...], ... }
   */
  getProjectData() {
    return this.em.storeData();
  }

  /**
   * Load data from the JSON project
   * @param {Object} data Project to load
   * @example
   * editor.loadProjectData({ pages: [...], styles: [...], ... })
   */
  loadProjectData(data: ProjectData) {
    return this.em.loadData(data);
  }

  storeData() {
    return this.em.storeData();
  }

  loadData(data: any) {
    return this.em.loadData(data);
  }

  /**
   * Returns container element. The one which was indicated as 'container'
   * on init method
   * @return {HTMLElement}
   */
  getContainer() {
    return this.config.el;
  }

  /**
   * Return the count of changes made to the content and not yet stored.
   * This count resets at any `store()`
   * @return {number}
   */
  getDirtyCount() {
    return this.em.getDirtyCount();
  }

  /**
   * Reset the counter of changes.
   */
  clearDirtyCount() {
    return this.em.clearDirtyCount();
  }

  /**
   * Update editor dimension offsets
   *
   * This method could be useful when you update, for example, some position
   * of the editor element (eg. canvas, panels, etc.) with CSS, where without
   * refresh you'll get misleading position of tools
   * @param {Object} [options] Options
   * @param {Boolean} [options.tools=false] Update the position of tools (eg. rich text editor, component highlighter, etc.)
   */
  refresh(opts?: { tools?: boolean }) {
    this.em.refreshCanvas(opts);
  }

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
   *   }
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
  setCustomRte<T>(obj: CustomRTE & ThisType<T & CustomRTE>) {
    this.RichTextEditor.customRte = obj;
  }

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
  setCustomParserCss(parser: CustomParserCss) {
    this.Parser.getConfig().parserCss = parser;
    return this;
  }

  /**
   * Change the global drag mode of components.
   * To get more about this feature read: https://github.com/GrapesJS/grapesjs/issues/1936
   * @param {String} value Drag mode, options: 'absolute' | 'translate'
   * @returns {this}
   */
  setDragMode(value: DragMode) {
    this.em.setDragMode(value);
    return this;
  }

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
  log(msg: string, opts: { ns?: string; level?: string } = {}) {
    this.em.log(msg, opts);
    return this;
  }

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
   * editor.t('msg2', { params: { test: 'hello' } l: 'it' });
   */
  t(...args: any[]) {
    return this.em.t(...args);
  }

  /**
   * Attach event
   * @param  {string} event Event name
   * @param  {Function} callback Callback function
   * @return {this}
   */
  on(event: EditorEvent, callback: EventHandler) {
    this.em.on(event, callback);
    return this;
  }

  /**
   * Attach event and detach it after the first run
   * @param  {string} event Event name
   * @param  {Function} callback Callback function
   * @return {this}
   */
  once(event: EditorEvent, callback: EventHandler) {
    this.em.once(event, callback);
    return this;
  }

  /**
   * Detach event
   * @param  {string} event Event name
   * @param  {Function} callback Callback function
   * @return {this}
   */
  off(event: EditorEvent, callback: EventHandler) {
    this.em.off(event, callback);
    return this;
  }

  /**
   * Trigger event
   * @param  {string} event Event to trigger
   * @return {this}
   */
  trigger(event: EditorEvent, ...args: any[]) {
    this.em.trigger.apply(this.em, [event, ...args]);
    return this;
  }

  /**
   * Destroy the editor
   */
  destroy() {
    if (!this.em) return;
    this.em.destroyAll();
    this.editorView = undefined;
  }

  /**
   * Returns editor element
   * @return {HTMLElement}
   * @private
   */
  getEl() {
    return this.editorView?.el;
  }

  /**
   * Returns editor model
   * @return {Model}
   * @private
   */
  getModel() {
    return this.em;
  }

  /**
   * Render editor
   * @return {HTMLElement}
   */
  render() {
    this.editorView?.remove();
    this.editorView = new EditorView(this.em);
    return this.editorView.render().el;
  }

  /**
   * Trigger a callback once the editor is loaded and rendered.
   * The callback will be executed immediately if the method is called on the already rendered editor.
   * @param  {Function} clb Callback to trigger
   * @example
   * editor.onReady(() => {
   *   // perform actions
   * });
   */
  onReady(clb: EventHandler) {
    this.em.get('ready') ? clb(this) : this.em.on('load', clb);
  }

  /**
   * Print safe HTML by using ES6 tagged template strings.
   * @param {Array<String>} literals
   * @param  {Array<String>} substs
   * @returns {String}
   * @example
   * const unsafeStr = '<script>....</script>';
   * const safeStr = '<b>Hello</b>';
   * // Use `$${var}` to avoid escaping
   * const strHtml = editor.html`Escaped ${unsafeStr} unescaped $${safeStr}`;
   */
  html = html;
}
