import { isFunction, isString } from 'underscore';
import { ItemManagerModule, ModuleConfig } from '../abstract/Module';
import BlocksEvents from '../block_manager/types';
import DeviceEvents from '../device_manager/types';
import { ComponentsEvents } from '../dom_components/types';
import EditorModel from '../editor/model/Editor';
import type { EditorEvent, EditorEventCallbacks } from '../editor/types';
import { KeymapsEvents } from '../keymaps/types';
import { StyleManagerEvents } from '../style_manager/types';
import PluginModel, { createPluginAdded } from './model/Plugin';
import Plugins from './model/Plugins';
import { Plugin, PluginCleanup, PluginInput, PluginItem, PluginOptions, PluginsEvents, PluginTarget } from './types';
import { getPlugin, getPluginId, isPluginDescriptor, isPluginFunction, logPluginWarn, unwrapPluginMeta } from './utils';

export default class PluginManager extends ItemManagerModule<ModuleConfig, Plugins> {
  events = PluginsEvents;
  storageKey = '';

  constructor(em: EditorModel) {
    super(em, 'PluginManager', new Plugins(), PluginsEvents, {});
  }

  get editor() {
    return this.em.getEditor();
  }

  private getConfigPluginOptions(id: string, sourcePlugin: string | Plugin<any>) {
    const pluginsOpts = this.editor.getConfig().pluginsOpts || {};
    const inlineKey = isFunction(sourcePlugin) ? sourcePlugin.toString() : '';
    return pluginsOpts[id] || (inlineKey ? pluginsOpts[inlineKey] || {} : {});
  }

  private generatePluginId() {
    return `gjs-plugin:${this._createId(16, 0)}`;
  }

  private resolvePluginId(input: string | Plugin<any>, plugin: Plugin<any>, explicitId?: string) {
    return explicitId || (isString(input) ? input : '') || getPluginId(plugin) || this.generatePluginId();
  }

  private resolvePluginTarget(target: PluginTarget) {
    if (target instanceof PluginModel) return target;

    if (isString(target)) return this.get(target);

    const { plugin } = unwrapPluginMeta(target as Plugin<any>);
    if (!isPluginFunction(plugin)) return;

    return this.getAll().find((item) => item.get('plugin') === plugin);
  }

  private normalizePlugin(input: PluginInput, options: PluginOptions = {}) {
    const descriptor = isPluginDescriptor(input) ? input : undefined;
    const sourcePlugin = (descriptor ? descriptor.plugin : input) as string | Plugin<any>;
    const explicitId = descriptor?.id || '';
    const unwrapped = unwrapPluginMeta(sourcePlugin);
    const resolvedPlugin = getPlugin(unwrapped.plugin);
    let normalized;

    if (!resolvedPlugin || !isPluginFunction(resolvedPlugin)) {
      const pluginId = isString(unwrapped.plugin) ? unwrapped.plugin : getPluginId(unwrapped.plugin) || explicitId;
      if (explicitId) {
        throw new Error(`Plugin ${explicitId} not found`);
      }
      logPluginWarn(this.editor, pluginId || 'unknown');
    } else {
      const id = explicitId || this.resolvePluginId(sourcePlugin, resolvedPlugin);
      normalized = {
        id,
        plugin: resolvedPlugin,
        options: {
          ...this.getConfigPluginOptions(id, sourcePlugin),
          ...unwrapped.options,
          ...options,
        },
      };
    }

    return normalized;
  }

  private createAddedTracker() {
    const added = createPluginAdded();
    const cleanup: PluginCleanup[] = [];
    const { editor } = this;
    const listeners: Array<[EditorEvent, (...args: any[]) => void]> = [];
    const listen = <E extends EditorEvent & keyof EditorEventCallbacks>(
      event: E,
      callback: (...args: EditorEventCallbacks[E]) => void,
    ) => {
      editor.on(event, callback as any);
      listeners.push([event, callback]);
    };

    listen(BlocksEvents.add, (block) => {
      const id = block.get('id');
      if (!id || added.blocks.includes(id)) return;
      added.blocks.push(id);
      cleanup.push(() => editor.Blocks.remove(id));
    });

    listen(KeymapsEvents.add, (keymap) => {
      const id = keymap.id;
      if (!id || added.keymaps.includes(id)) return;
      added.keymaps.push(id);
      cleanup.push(() => editor.Keymaps.remove(id));
    });

    listen(ComponentsEvents.typeAdd, (type) => {
      const id = type.id;
      if (!id || added.componentTypes.includes(id)) return;
      added.componentTypes.push(id);
      cleanup.push(() => editor.Components.removeType(id));
    });

    listen(DeviceEvents.add, (device) => {
      const id = device.get('id');
      if (!id || added.devices.includes(id)) return;
      added.devices.push(id);
      cleanup.push(() => editor.Devices.remove(id));
    });

    listen(StyleManagerEvents.sectorAdd, (sector) => {
      const id = sector.get('id');
      if (!id || added.styleSectors.includes(id)) return;
      added.styleSectors.push(id);
      cleanup.push(() => editor.StyleManager.removeSector(id));
    });

    return {
      added,
      stop: () => listeners.forEach(([event, callback]) => editor.off(event, callback)),
      cleanup: () => {
        cleanup
          .slice()
          .reverse()
          .forEach((cb) => cb());
      },
    };
  }

  add(input: PluginInput, options: PluginOptions = {}): PluginItem | undefined {
    const normalized = this.normalizePlugin(input, options);
    if (!normalized) return;

    const existing = this.get(normalized.id);
    if (existing) return existing;

    const tracking = this.createAddedTracker();
    let result: unknown;

    try {
      result = normalized.plugin(this.editor, normalized.options);
    } catch (error) {
      tracking.stop();
      tracking.cleanup();
      throw error;
    }

    tracking.stop();

    const plugin = new PluginModel({
      id: normalized.id,
      plugin: normalized.plugin,
      options: normalized.options,
      added: tracking.added,
      cleanup: () => {},
    });

    let cleaned = false;
    const builtInCleanup = () => {
      if (cleaned) return;
      cleaned = true;
      tracking.cleanup();
    };

    const cleanup = () => {
      if (cleaned) return;
      const customCleanup = isFunction(result) ? result : null;

      if (customCleanup) {
        customCleanup({
          cleanup: builtInCleanup,
          editor: this.editor,
          plugin,
        });
      } else {
        builtInCleanup();
      }
    };

    plugin.set('cleanup', cleanup);
    this.all.add(plugin);
    return plugin;
  }

  get(id: string): PluginItem | undefined {
    return this.all.get(id);
  }

  getAll(): PluginItem[] {
    return [...this.all.models];
  }

  remove(target: PluginTarget, opts: Record<string, any> = {}): PluginItem | undefined {
    const plugin = this.resolvePluginTarget(target);
    if (!plugin) return;

    const { em, events } = this;
    const rm = () => {
      plugin.get('cleanup')?.();
      this.all.remove(plugin, opts);
      return plugin;
    };

    !opts.silent && em.trigger(events.removeBefore, plugin, rm, opts);
    return !opts.abort ? rm() : undefined;
  }

  destroy() {
    this.__destroy();
  }
}
