import { Collection } from 'common';
import Sector from './Sector';

export default class Sectors extends Collection {
  initialize(prop, opts = {}) {
    this.em = opts.em;
    this.listenTo(this, 'reset', this.onReset);
  }

  model(props, opts = {}) {
    const { em } = opts.collection;
    return new Sector(props, { ...opts, em });
  }

  onReset(models, opts = {}) {
    const prev = opts.previousModels || [];
    prev.forEach(sect => sect.get('properties').reset());
  }
}
