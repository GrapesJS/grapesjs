import { Model } from '../../common';
import { Plugin as PluginFn, PluginAdded, PluginCleanup } from '../types';

export const createPluginAdded = (): PluginAdded => ({
  blocks: [],
  commands: [],
  keymaps: [],
  componentTypes: [],
  devices: [],
  traitTypes: [],
  styleTypes: [],
  assetTypes: [],
  styleSectors: [],
  styleProperties: [],
});

export interface PluginProperties {
  id: string;
  plugin: PluginFn<any>;
  options: Record<string, any>;
  added: PluginAdded;
  cleanup: PluginCleanup;
}

export default class Plugin extends Model<PluginProperties> {
  defaults(): PluginProperties {
    return {
      id: '',
      plugin: (() => {}) as PluginFn<any>,
      options: {},
      added: createPluginAdded(),
      cleanup: () => {},
    };
  }
}
