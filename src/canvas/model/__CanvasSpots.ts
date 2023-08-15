import { debounce } from 'underscore';
import CanvasModule from '..';
import { ModuleCollection } from '../../abstract';
import { ObjectAny } from '../../common';
import CanvasSpot, { CanvasSpotProps } from './CanvasSpot';

export default class CanvasSpots extends ModuleCollection<CanvasSpot> {
  refreshDbn: ReturnType<typeof debounce>;

  constructor(module: CanvasModule, models: CanvasSpot[] | CanvasSpotProps[] = []) {
    super(module, models, CanvasSpot);
    this.on('add', this.onAdd);
    this.on('change', this.onChange);
    this.on('remove', this.onRemove);
    const { em } = this;
    this.refreshDbn = debounce(() => this.refresh(), 100);
    const dbnEvents = 'component:resize styleable:change component:input';
    this.listenTo(em, dbnEvents, () => this.refreshDbn());
  }

  get em() {
    return this.module.em;
  }

  get events() {
    return this.module.events;
  }

  refresh() {
    const { em, events } = this;
    em.trigger(events.spot);
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

  __trgEvent(event: string, props: ObjectAny) {
    const { module } = this;
    const { em } = module;
    em.trigger(event, props);
    this.refresh();
  }
}
