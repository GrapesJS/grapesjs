import CollectionWithPatches from '../../patch_manager/CollectionWithPatches';
import Device from './Device';

export default class Devices extends CollectionWithPatches<Device> {
  patchObjectType = 'devices';

  constructor(models?: any, opts: any = {}) {
    super(models, { ...opts, patchObjectType: 'devices', collectionId: opts.collectionId || 'global' } as any);
  }
}

Devices.prototype.model = Device;
