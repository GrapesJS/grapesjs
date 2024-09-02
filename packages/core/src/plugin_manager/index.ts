import { isString } from 'underscore';
import Editor from '../editor';
import { getGlobal } from '../utils/mixins';

type PluginOptions = Record<string, any>;

export type Plugin<T extends PluginOptions = {}> = (editor: Editor, config: T) => void;

const getPluginById = (pluginId: string, plugins: PluginManager) => {
  let result = plugins.get(pluginId);

  // Try to search in global context
  if (!result) {
    const wplg = (getGlobal() as any)[pluginId];
    result = wplg?.default || wplg;
  }

  return result;
};

export const getPlugin = (plugin: string | Plugin<any>, plugins: PluginManager) => {
  return isString(plugin)
    ? getPluginById(plugin, plugins)
    : (plugin as unknown as { default: Plugin<any> })?.default || plugin;
};

export const logPluginWarn = (editor: Editor, plugin: string) => {
  editor.getModel().logWarning(`Plugin ${plugin} not found`, {
    context: 'plugins',
    plugin,
  });
};

export default class PluginManager {
  plugins: Record<string, Plugin> = {};

  /**
   * Add new plugin. Plugins could not be overwritten
   * @param {string} id Plugin ID
   * @param {Function} plugin Function which contains all plugin logic
   * @return {Function} The plugin function
   * @deprecated Don't use named plugins, create plugins as simple functions. More about [Plugins](https://grapesjs.com/docs/modules/Plugins.html)
   * @example
   * PluginManager.add('some-plugin', function(editor) {
   *   editor.Commands.add('new-command', {
   *     run:  function(editor, senderBtn){
   *       console.log('Executed new-command');
   *     }
   *   })
   * });
   */
  add<T extends PluginOptions>(id: string, plugin: Plugin<T>) {
    const plg = this.get(id);

    if (plg) {
      return plg;
    }

    // @ts-ignore
    this.plugins[id] = plugin;

    return plugin;
  }

  /**
   * Returns plugin by ID
   * @param  {string} id Plugin ID
   * @return {Function|undefined} Plugin
   * @example
   * var plugin = PluginManager.get('some-plugin');
   * plugin(editor);
   */
  get<T extends PluginOptions>(id: string): Plugin<T> | undefined {
    return this.plugins[id];
  }

  /**
   * Returns object with all plugins
   */
  getAll() {
    return this.plugins;
  }
}
