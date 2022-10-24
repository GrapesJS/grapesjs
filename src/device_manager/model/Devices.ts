import { Collection } from '../../common';
import Device from './Device';

export default class Devices extends Collection<Device> {}

Devices.prototype.model = Device;
