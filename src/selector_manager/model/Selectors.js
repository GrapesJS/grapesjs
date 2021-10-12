import { filter } from 'underscore';
import { Collection } from 'common';
import Selector from './Selector';

export default class Selectors extends Collection {
  modelId(attr) {
    return `${attr.name}_${attr.type || Selector.TYPE_CLASS}`;
  }

  getStyleable() {
    return filter(
      this.models,
      item => item.get('active') && !item.get('private')
    );
  }

  getValid({ noDisabled } = {}) {
    return filter(this.models, item => !item.get('private')).filter(item =>
      noDisabled ? item.get('active') : 1
    );
  }

  getFullString(collection, opts = {}) {
    const result = [];
    const coll = collection || this;
    coll.forEach(selector => result.push(selector.getFullName(opts)));
    return result.join('').trim();
  }
}

Selectors.prototype.model = Selector;
