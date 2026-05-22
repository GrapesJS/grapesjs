import { isFunction, isString } from 'underscore';
import type Editor from '../editor';
import { getGlobal } from '../utils/mixins';
import type { Plugin, PluginDescriptor, PluginOptions, PluginWithMeta } from './types';

const LEGACY_PLUGIN_ERROR =
  'grapesjs.plugins.add(...) is deprecated. Pass plugins directly via init({ plugins: [...] }) or use usePlugin(...).';

const legacyPlugins = new Map<string, Plugin<any>>();

export const isPluginFunction = (value: unknown): value is Plugin<any> => isFunction(value);

export const isPluginDescriptor = (value: unknown): value is PluginDescriptor =>
  !!value && typeof value === 'object' && !isFunction(value) && 'plugin' in value;

export const unwrapPluginMeta = (
  plugin: string | Plugin<any>,
): { plugin: string | Plugin<any>; options: PluginOptions; id?: string } => {
  let current = plugin;
  const options: PluginOptions = {};
  let id: string | undefined;

  while (isPluginFunction(current) && (current as PluginWithMeta<any>).__gjsPluginMeta) {
    const meta = (current as PluginWithMeta<any>).__gjsPluginMeta!;
    current = meta.plugin;
    Object.assign(options, meta.options || {});
    id = id || meta.id;
  }

  return { plugin: current, options, id };
};

export const getLegacyPlugin = (pluginId: string) => legacyPlugins.get(pluginId);

export const getLegacyPlugins = () => legacyPlugins;

export const clearLegacyPlugins = () => legacyPlugins.clear();

export const addLegacyPlugin = <T extends PluginOptions>(id: string, plugin: Plugin<T>) => {
  console.error(LEGACY_PLUGIN_ERROR);
  legacyPlugins.set(id, plugin);
  return plugin;
};

export const legacyGlobalPlugins = {
  add: addLegacyPlugin,
  get: getLegacyPlugin,
  getAll: getLegacyPlugins,
  clear: clearLegacyPlugins,
};

export const findLegacyPluginId = (plugin: Plugin<any>) => {
  let result = '';
  legacyPlugins.forEach((storedPlugin, id) => {
    if (!result && storedPlugin === plugin) {
      result = id;
    }
  });
  return result || undefined;
};

export const findGlobalPluginId = (plugin: Plugin<any>) => {
  const globalPlugins = getGlobal() as Record<string, any>;

  return Object.keys(globalPlugins).find((id) => {
    try {
      const globalPlugin = globalPlugins[id];
      return globalPlugin === plugin || globalPlugin?.default === plugin;
    } catch (error) {
      return false;
    }
  });
};

export const getPluginId = (plugin: Plugin<any>) =>
  plugin.__gjsPluginId || findLegacyPluginId(plugin) || findGlobalPluginId(plugin);

export const getPluginById = (pluginId: string) => {
  const legacy = getLegacyPlugin(pluginId);

  if (legacy) return legacy;

  const globalPlugin = (getGlobal() as any)[pluginId];
  return globalPlugin?.default || globalPlugin;
};

export const getPlugin = (plugin: string | Plugin<any>): Plugin<any> | undefined => {
  const { plugin: unwrapped } = unwrapPluginMeta(plugin);
  return isString(unwrapped)
    ? getPluginById(unwrapped)
    : (unwrapped as unknown as { default?: Plugin<any> })?.default || unwrapped;
};

export const logPluginWarn = (editor: Editor, plugin: string) => {
  editor.getModel().logWarning(`Plugin ${plugin} not found`, { context: 'plugins', plugin });
};

export const usePlugin = <P extends Plugin<any> | string>(plugin: P, opts?: P extends Plugin<infer C> ? C : {}) => {
  const options = opts || {};
  const wrapped: PluginWithMeta<any> = (editor: Editor) => {
    const pluginResult = getPlugin(plugin);

    if (pluginResult) {
      pluginResult(editor, options);
    } else {
      logPluginWarn(editor, plugin as string);
    }
  };

  const id = typeof plugin === 'string' ? plugin : plugin.__gjsPluginId;
  wrapped.__gjsPluginMeta = { id, plugin, options };

  return wrapped;
};
