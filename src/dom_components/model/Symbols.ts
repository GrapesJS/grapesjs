import { debounce } from 'underscore';
import { Debounced, ObjectAny } from '../../common';
import Component from './Component';
import Components from './Components';
import { detachSymbolInstance, getSymbolInstances } from './SymbolUtils';

export default class Symbols extends Components {
  refreshDbn: Debounced;

  constructor(...args: ConstructorParameters<typeof Components>) {
    super(...args);
    this.refreshDbn = debounce(() => this.refresh(), 0);
  }

  removeChildren(component: Component, coll?: Components, opts: any = {}) {
    super.removeChildren(component, coll, opts);
    getSymbolInstances(component)?.forEach(i => detachSymbolInstance(i, { skipRefs: true }));
    this.__trgEvent(this.events.symbolMainRemove, { component });
  }

  onAdd(...args: Parameters<Components['onAdd']>) {
    super.onAdd(...args);
    const [component] = args;
    this.__trgEvent(this.events.symbolMainAdd, { component });
  }

  refresh() {
    const { em, events } = this;
    em.trigger(events.symbol);
  }

  __trgEvent(event: string, props: ObjectAny) {
    this.em.trigger(event, props);
    this.em.trigger(this.events.symbolMain, { ...props, event });
    this.refreshDbn();
  }
}
