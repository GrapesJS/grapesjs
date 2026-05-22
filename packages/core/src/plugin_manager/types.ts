import type Editor from '../editor';
import {
  EventCallbackAdd,
  EventCallbackAll,
  EventCallbackRemove,
  EventCallbackRemoveBefore,
  EventCallbackUpdate,
} from '../common';
import PluginModel from './model/Plugin';

export type PluginOptions = Record<string, any>;

export interface PluginAdded {
  blocks: string[];
  commands: string[];
  keymaps: string[];
  componentTypes: string[];
  devices: string[];
  traitTypes: string[];
  styleTypes: string[];
  assetTypes: string[];
  styleSectors: string[];
  styleProperties: Array<{ sectorId: string; id: string }>;
}

export type PluginCleanup = () => void;

export type PluginCleanupHandler = (ctx: { cleanup: PluginCleanup; plugin: PluginModel }) => void;

export type PluginResult = void | PluginCleanupHandler | object | null | undefined;

export interface Plugin<T extends PluginOptions = {}> {
  (editor: Editor, config: T): PluginResult;
  __gjsPluginId?: string;
}

export interface PluginDescriptor {
  id: string;
  plugin: Plugin<any>;
}

export interface PluginWithMeta<T extends PluginOptions = {}> extends Plugin<T> {
  __gjsPluginMeta?: {
    plugin: string | Plugin<any>;
    options?: T;
    id?: string;
  };
}

export type PluginInput = string | Plugin<any> | PluginDescriptor;

export type PluginEvent = `${PluginsEvents}`;

/**{START_EVENTS}*/
export enum PluginsEvents {
  /**
   * @event `plugin:add` Plugin installed in the editor.
   * @example
   * editor.on('plugin:add', (plugin) => { ... });
   */
  add = 'plugin:add',

  /**
   * @event `plugin:remove` Plugin removed from the editor.
   * @example
   * editor.on('plugin:remove', (plugin) => { ... });
   */
  remove = 'plugin:remove',

  /**
   * @event `plugin:remove:before` Triggered before plugin removal.
   * @example
   * editor.on('plugin:remove:before', (plugin, remove, opts) => { ... });
   */
  removeBefore = 'plugin:remove:before',

  /**
   * @event `plugin:update` Plugin updated.
   * @example
   * editor.on('plugin:update', (plugin, changes) => { ... });
   */
  update = 'plugin:update',

  /**
   * @event `plugin` Catch-all event for plugin changes.
   * @example
   * editor.on('plugin', ({ event, model, ... }) => { ... });
   */
  all = 'plugin',
}
/**{END_EVENTS}*/

export interface PluginsEventCallback {
  [PluginsEvents.add]: EventCallbackAdd<PluginModel>;
  [PluginsEvents.remove]: EventCallbackRemove<PluginModel>;
  [PluginsEvents.removeBefore]: EventCallbackRemoveBefore<PluginModel>;
  [PluginsEvents.update]: EventCallbackUpdate<PluginModel>;
  [PluginsEvents.all]: EventCallbackAll<PluginEvent, PluginModel>;
}

export default PluginsEvents;
