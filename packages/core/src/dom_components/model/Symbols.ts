import { debounce } from 'underscore';
import { Debounced, ObjectAny } from '../../common';
import Component from './Component';
import Components from './Components';
import { detachSymbolInstance, getSymbolInstances } from './SymbolUtils';

interface PropsComponentUpdate {
  component: Component;
  changed: ObjectAny;
  options: ObjectAny;
}

export default class Symbols extends Components {
  refreshDbn: Debounced;

  constructor(...args: ConstructorParameters<typeof Components>) {
    super(...args);
    this.refreshDbn = debounce(() => this.refresh(), 0);
    const { events } = this;
    this.on(events.update, this.onUpdate);
    this.on(events.updateInside, this.onUpdateDeep);
  }

  removeChildren(component: Component, coll?: Components, opts: any = {}) {
    super.removeChildren(component, coll, opts);
    getSymbolInstances(component)?.forEach((i) => detachSymbolInstance(i, { skipRefs: true }));
    this.__trgEvent(this.events.symbolMainRemove, { component });
  }

  onAdd(...args: Parameters<Components['onAdd']>) {
    super.onAdd(...args);
    const [component] = args;
    this.__trgEvent(this.events.symbolMainAdd, { component });
  }

  onUpdate(props: PropsComponentUpdate) {
    this.__trgEvent(this.events.symbolMainUpdate, props);
  }

  onUpdateDeep(props: PropsComponentUpdate) {
    this.__trgEvent(this.events.symbolMainUpdateDeep, props);
  }

  refresh() {
    const { em, events } = this;
    em.trigger(events.symbol);
  }

  __trgEvent(event: string, props: ObjectAny, isInstance = false) {
    const { em, events } = this;
    const eventType = isInstance ? events.symbolInstance : events.symbolMain;
    em.trigger(event, props);
    em.trigger(eventType, { ...props, event });
    this.refreshDbn();
  }
}
