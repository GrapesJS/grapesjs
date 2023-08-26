import { isElement } from 'underscore';
import Editor from './editor';
import { EditorConfig } from './editor/config/config';
import PluginManager, { Plugin, getPlugin, logPluginWarn } from './plugin_manager';
import $ from './utils/cash-dom';
import polyfills from './utils/polyfills';

interface InitEditorConfig extends EditorConfig {
  grapesjs?: typeof grapesjs;
}

polyfills();

const plugins = new PluginManager();
const editors: Editor[] = [];

export const usePlugin = <P extends Plugin<any> | string>(plugin: P, opts?: P extends Plugin<infer C> ? C : {}) => {
  let pluginResult = getPlugin(plugin, plugins);

  return (editor: Editor) => {
    if (pluginResult) {
      pluginResult(editor, opts || {});
    } else {
      logPluginWarn(editor, plugin as string);
    }
  };
};

export const grapesjs = {
  $,

  editors,

  plugins,

  usePlugin,

  // @ts-ignore Will be replaced on build
  version: __GJS_VERSION__,

  /**
   * Initialize the editor with passed options
   * @param {Object} config Configuration object
   * @param {string|HTMLElement} config.container Selector which indicates where render the editor
   * @param {Boolean} [config.autorender=true] If true, auto-render the content
   * @param {Array} [config.plugins=[]] Array of plugins to execute on start
   * @param {Object} [config.pluginsOpts={}] Custom options for plugins
   * @param {Boolean} [config.headless=false] Init headless editor
   * @return {Editor} Editor instance
   * @example
   * var editor = grapesjs.init({
   *   container: '#myeditor',
   *   components: '<article class="hello">Hello world</article>',
   *   style: '.hello{color: red}',
   * })
   */
  init(config: EditorConfig = {}) {
    const { headless } = config;
    const els = config.container;
    if (!els && !headless) throw new Error("'container' is required");
    const initConfig: InitEditorConfig = {
      autorender: true,
      plugins: [],
      pluginsOpts: {},
      ...config,
      grapesjs: this,
      el: headless ? undefined : isElement(els) ? els : (document.querySelector(els!) as HTMLElement),
    };
    const editor = new Editor(initConfig, { $ });
    const em = editor.getModel();

    // Load plugins
    initConfig.plugins!.forEach(pluginId => {
      const plugin = getPlugin(pluginId, plugins);
      const plgOptions = initConfig.pluginsOpts![pluginId as string] || {};

      if (plugin) {
        plugin(editor, plgOptions);
      } else {
        logPluginWarn(editor, pluginId as string);
      }
    });

    // Execute `onLoad` on modules once all plugins are initialized.
    // A plugin might have extended/added some custom type so this
    // is a good point to load stuff like components, css rules, etc.
    em.loadOnStart();
    initConfig.autorender && !headless && editor.render();
    editors.push(editor);

    return editor;
  },
};

// Exports for TS
export type { default as Asset } from './asset_manager/model/Asset';
export type { default as Assets } from './asset_manager/model/Assets';
export type { default as Block } from './block_manager/model/Block';
export type { default as Blocks } from './block_manager/model/Blocks';
export type { default as Categories } from './block_manager/model/Categories';
export type { default as Category } from './block_manager/model/Category';
export type { default as Canvas } from './canvas/model/Canvas';
export type { default as CanvasSpot } from './canvas/model/CanvasSpot';
export type { default as CanvasSpots } from './canvas/model/CanvasSpots';
export type { default as Frame } from './canvas/model/Frame';
export type { default as Frames } from './canvas/model/Frames';
export type { default as CssRule } from './css_composer/model/CssRule';
export type { default as CssRules } from './css_composer/model/CssRules';
export type { default as Device } from './device_manager/model/Device';
export type { default as Devices } from './device_manager/model/Devices';
export type { default as ComponentManager } from './dom_components';
export type { default as Component } from './dom_components/model/Component';
export type { default as Components } from './dom_components/model/Components';
export type { default as ComponentView } from './dom_components/view/ComponentView';
export type { default as Editor } from './editor';
export type { default as Modal } from './modal_dialog/model/Modal';
export type { default as Page } from './pages/model/Page';
export type { default as Pages } from './pages/model/Pages';
export type { default as Button } from './panels/model/Button';
export type { default as Buttons } from './panels/model/Buttons';
export type { default as Panel } from './panels/model/Panel';
export type { default as Panels } from './panels/model/Panels';
export type { default as Selector } from './selector_manager/model/Selector';
export type { default as Selectors } from './selector_manager/model/Selectors';
export type { default as State } from './selector_manager/model/State';
export type { default as Properties } from './style_manager/model/Properties';
export type { default as Property } from './style_manager/model/Property';
export type { default as PropertyRadio } from './style_manager/model/PropertyRadio';
export type { default as PropertySelect } from './style_manager/model/PropertySelect';
export type { default as PropertyNumber } from './style_manager/model/PropertyNumber';
export type { default as PropertySlider } from './style_manager/model/PropertySlider';
export type { default as PropertyComposite } from './style_manager/model/PropertyComposite';
export type { default as PropertyStack } from './style_manager/model/PropertyStack';
export type { default as Sector } from './style_manager/model/Sector';
export type { default as Sectors } from './style_manager/model/Sectors';
export type { default as Trait } from './trait_manager/model/Trait';
export type { default as Traits } from './trait_manager/model/Traits';

export default grapesjs;
