import { isElement, isFunction } from 'underscore';
import $ from './utils/cash-dom';
import Editor from './editor';
import polyfills from './utils/polyfills';
import { getGlobal } from './utils/mixins';
import PluginManager from './plugin_manager';
import { EditorConfig } from './editor/config/config';

interface InitEditorConfig extends EditorConfig {
  grapesjs?: typeof GrapesJS;
}

polyfills();

const plugins = new PluginManager();
const editors: Editor[] = [];

const GrapesJS = {
  $,

  editors,

  plugins,

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
      let plugin = isFunction(pluginId) ? pluginId : plugins.get(pluginId);
      const plgOptions = initConfig.pluginsOpts![pluginId as string] || {};

      // Try to search in global context
      if (!plugin) {
        // @ts-ignore
        const wplg = getGlobal()[pluginId];
        plugin = wplg?.default || wplg;
      }

      if (plugin) {
        plugin(editor, plgOptions);
      } else if (isFunction(pluginId)) {
        pluginId(editor, plgOptions);
      } else {
        em.logWarning(`Plugin ${pluginId} not found`, {
          context: 'plugins',
          plugin: pluginId,
        });
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
export type { default as Editor } from './editor';
export type { default as Asset } from './asset_manager/model/Asset';
export type { default as Assets } from './asset_manager/model/Assets';
export type { default as Block } from './block_manager/model/Block';
export type { default as Blocks } from './block_manager/model/Blocks';
export type { default as Category } from './block_manager/model/Category';
export type { default as Categories } from './block_manager/model/Categories';
export type { default as Canvas } from './canvas/model/Canvas';
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
export type { default as Property } from './style_manager/model/Property';
export type { default as Properties } from './style_manager/model/Properties';
export type { default as Trait } from './trait_manager/model/Trait';
export type { default as Traits } from './trait_manager/model/Traits';

export default GrapesJS;
