import { Model } from '../../common';
import type { PluginItemProps, PluginAdded } from '../types';

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
});

export default class PluginModel extends Model<PluginItemProps> {
  defaults(): PluginItemProps {
    return {
      id: '',
      plugin: (() => {}) as PluginItemProps['plugin'],
      options: {},
      added: createPluginAdded(),
      cleanup: () => {},
    };
  }
}
