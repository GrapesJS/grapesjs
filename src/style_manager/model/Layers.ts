import { Collection } from '../../common';
import Layer from './Layer';

export default class Layers extends Collection<Layer> {
  prop: any;

  initialize(p: any, opts: { prop?: any } = {}) {
    this.prop = opts.prop;
  }
}

Layers.prototype.model = Layer;
