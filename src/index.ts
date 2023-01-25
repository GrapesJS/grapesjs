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

export default GrapesJS;
