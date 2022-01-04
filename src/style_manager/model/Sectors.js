import { Collection } from 'common';
import Sector from './Sector';

export default class Sectors extends Collection {
  initialize(prop, opts = {}) {
    const { module, em } = opts;
    this.em = em;
    this.module = module;
    this.listenTo(this, 'reset', this.onReset);
    module && this.listenTo(em, module.events.target, this.__targetUpdated);
  }

  model(props, opts = {}) {
    const { em } = opts.collection;
    return new Sector(props, { ...opts, em });
  }

  onReset(models, opts = {}) {
    const prev = opts.previousModels || [];
    prev.forEach(sect => sect.get('properties').reset());
  }

  __targetUpdated() {
    const component = this.em.getSelected();
    const target = this.module.getSelected();
    const params = { target, component, sectors: this };

    this.forEach(sector => {
      const props = sector.getProperties();
      props.forEach(prop => {
        const isVisible = prop.__checkVisibility(params);
        prop.set('visible', isVisible);
      });
      sector.set(
        'visible',
        props.some(p => p.isVisible())
      );
    });
  }
}
