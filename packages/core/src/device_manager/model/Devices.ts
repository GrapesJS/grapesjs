import { Collection } from '../../common';
import Device from './Device';

export default class Devices extends Collection<Device> {
  constructor(models?: any, opts: any = {}) {
    super(models, opts);
  }
}

Devices.prototype.model = Device;
