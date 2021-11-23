import { filter } from 'underscore';
import { Collection } from 'common';
import Selector from './Selector';

const combine = (tail, curr) => {
  return tail.reduce(
    (acc, item, n) => {
      return acc.concat(combine(tail.slice(n + 1), `${curr}${item}`));
    },
    [curr]
  );
};

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

  getFullName(opts = {}) {
    const { combination, array } = opts;
    let result = [];
    const sels = this.map(s => s.getFullName(opts)).sort();

    if (combination) {
      sels.forEach((sel, n) => {
        result = result.concat(combine(sels.slice(n + 1), sel));
      });
    } else {
      result = sels;
    }

    return array ? result : combination ? result.join(',') : result.join('');
  }
}

Selectors.prototype.model = Selector;
