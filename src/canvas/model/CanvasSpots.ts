import CanvasModule from '..';
import { ModuleCollection } from '../../abstract';
import CanvasSpot, { CanvasSpotProps } from './CanvasSpot';

export default class CanvasSpots extends ModuleCollection<CanvasSpot> {
  constructor(module: CanvasModule, models: CanvasSpot[] | CanvasSpotProps[] = []) {
    super(module, models, CanvasSpot);
    this.on('add', this.onAdd);
    this.on('change', this.onChange);
  }

  onAdd(spot: CanvasSpot) {
    const { module } = this;
    const { em, events } = module;
    em.trigger(events.spotAdd, { spot });
  }

  onChange(spot: CanvasSpot) {
    const { module } = this;
    const { em, events } = module;
    em.trigger(events.spotUpdate, { spot });
  }
}
