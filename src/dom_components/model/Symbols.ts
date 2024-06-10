import Component from './Component';
import Components from './Components';
import { detachSymbolInstance, getSymbolInstances } from './SymbolUtils';

export default class Symbols extends Components {
  removeChildren(removed: Component, coll?: Components, opts: any = {}) {
    super.removeChildren(removed, coll, opts);
    getSymbolInstances(removed)?.forEach(i => detachSymbolInstance(i, { skipRefs: true }));
  }
}
