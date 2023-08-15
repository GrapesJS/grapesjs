import CanvasModule from '..';
import { ModuleCollection } from '../../abstract';
import { ObjectAny } from '../../common';
import CanvasSpot, { CanvasSpotProps } from './CanvasSpot';

export default class CanvasSpots extends ModuleCollection<CanvasSpot> {
  constructor(module: CanvasModule, models: CanvasSpot[] | CanvasSpotProps[] = []) {
    super(module, models, CanvasSpot);
    this.on('add', this.onAdd);
    this.on('change', this.onChange);
    this.on('remove', this.onRemove);
  }

  __trgEvent(event: string, props: ObjectAny) {
    const { module } = this;
    const { em } = module;
    em.trigger(event, props);
    module.refreshSpots();
  }

  get events() {
    return this.module.events;
  }

  onAdd(spot: CanvasSpot) {
    this.__trgEvent(this.events.spotAdd, { spot });
  }

  onChange(spot: CanvasSpot) {
    this.__trgEvent(this.events.spotUpdate, { spot });
  }

  onRemove(spot: CanvasSpot) {
    this.__trgEvent(this.events.spotRemove, { spot });
  }
}
