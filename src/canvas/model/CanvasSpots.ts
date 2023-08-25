import { debounce } from 'underscore';
import CanvasModule from '..';
import { ModuleCollection } from '../../abstract';
import { Debounced, ObjectAny } from '../../common';
import EditorModel from '../../editor/model/Editor';
import CanvasSpot, { CanvasSpotProps } from './CanvasSpot';

export default class CanvasSpots extends ModuleCollection<CanvasSpot> {
  refreshDbn: Debounced;

  constructor(module: CanvasModule, models: CanvasSpot[] | CanvasSpotProps[] = []) {
    super(module, models, CanvasSpot);
    this.on('add', this.onAdd);
    this.on('change', this.onChange);
    this.on('remove', this.onRemove);
    const { em } = this;
    this.refreshDbn = debounce(() => this.refresh(), 0);
    const evToRefreshDbn = 'component:resize styleable:change component:input component:update frame:updated undo redo';
    this.listenTo(em, evToRefreshDbn, () => this.refreshDbn());
  }

  get em(): EditorModel {
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
    this.refreshDbn();
  }
}
