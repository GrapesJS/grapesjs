import {
  EventCallbackAdd,
  EventCallbackAll,
  EventCallbackRemove,
  EventCallbackRemoveBefore,
  EventCallbackUpdate,
  Model,
} from '../common';
import type Editor from '../editor';

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
}

export type PluginCleanup = () => void;

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

export interface PluginItemProps {
  id: string;
  plugin: Plugin<any>;
  options: Record<string, any>;
  added: PluginAdded;
  cleanup: PluginCleanup;
}

export type PluginItem = Model<PluginItemProps>;

export type PluginTarget = string | Plugin<any> | PluginItem;

export type PluginCleanupHandler = (ctx: { cleanup: PluginCleanup; plugin: PluginItem }) => void;

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
  [PluginsEvents.add]: EventCallbackAdd<PluginItem>;
  [PluginsEvents.remove]: EventCallbackRemove<PluginItem>;
  [PluginsEvents.removeBefore]: EventCallbackRemoveBefore<PluginItem>;
  [PluginsEvents.update]: EventCallbackUpdate<PluginItem>;
  [PluginsEvents.all]: EventCallbackAll<PluginEvent, PluginItem>;
}

export default PluginsEvents;
