import { Collection } from '../../common';
import Device from './Device';

export default class Devices extends Collection {}

Devices.prototype.model = Device;
