import Backbone from 'backbone';
import Device from './Device';

export default class Devices extends Backbone.Collection {
    getSorted() {
        return this.sort();
    }
}
Devices.prototype.model = Device;
Devices.prototype.comparator = (left, right) => {
    const max = Number.MAX_VALUE;
    return (right.get('priority') || max) - (left.get('priority') || max);
  };
