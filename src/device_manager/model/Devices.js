import { Collection } from 'backbone';
import Device from './Device';

export default class Devices extends Collection {
  comparator(left, right) {
    const max = Number.MAX_VALUE;
    return (right.get('priority') || max) - (left.get('priority') || max);
  }

  getSorted() {
    return this.sort();
  }
}

Devices.prototype.model = Device;
