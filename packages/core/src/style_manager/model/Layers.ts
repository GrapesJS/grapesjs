import { Collection } from '../../common';
import LayersView from '../view/LayersView';
import Layer from './Layer';

export default class Layers extends Collection<Layer> {
  prop: any;
  view?: LayersView;

  initialize(p: any, opts: { prop?: any } = {}) {
    this.prop = opts.prop;
  }
}

Layers.prototype.model = Layer;
