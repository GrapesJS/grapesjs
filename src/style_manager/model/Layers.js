import { Collection } from '../../common';
import Layer from './Layer';

export default class Layers extends Collection {
  initialize(p, opts = {}) {
    this.prop = opts.prop;
  }
}

Layers.prototype.model = Layer;
