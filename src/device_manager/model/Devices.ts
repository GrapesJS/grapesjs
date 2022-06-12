import { Collection } from '../../common';
import Device from './Device';

export default class Devices extends Collection<Device> {
  comparator = (left: Device, right: Device): number => {
    const max = Number.MAX_VALUE;
    return (right.get('priority') || max) - (left.get('priority') || max);
  }

  getSorted() {
    return this.sort();
  }
}
