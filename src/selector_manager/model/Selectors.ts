import { filter } from 'underscore';
import { Collection } from '../../common';
import Selector from './Selector';

const combine = (tail: string[], curr: string): string[] => {
  return tail.reduce(
    (acc, item, n) => {
      return acc.concat(combine(tail.slice(n + 1), `${curr}${item}`));
    },
    [curr]
  );
};

export interface FullNameOptions {
  combination?: boolean;
  array?: boolean;
}

export default class Selectors extends Collection<Selector> {
  modelId(attr: any) {
    return `${attr.name}_${attr.type || Selector.TYPE_CLASS}`;
  }

  getStyleable() {
    return filter(this.models, item => item.getActive() && !item.get('private'));
  }

  getValid({ noDisabled }: any = {}) {
    return filter(this.models, item => !item.get('private')).filter(item => (noDisabled ? item.get('active') : 1));
  }

  getFullString(collection?: Selector[] | null, opts: { sort?: boolean } = {}) {
    const result: string[] = [];
    const coll = collection || this;
    coll.forEach(selector => result.push(selector.getFullName(opts)));
    opts.sort && result.sort();
    return result.join('').trim();
  }

  getFullName<T extends FullNameOptions>(opts: T = {} as T) {
    const { combination, array } = opts;
    let result: string[] = [];
    const sels = this.map(s => s.getFullName(opts)).sort();

    if (combination) {
      sels.forEach((sel, n) => {
        result = result.concat(combine(sels.slice(n + 1), sel));
      });
    } else {
      result = sels;
    }

    return (array ? result : combination ? result.join(',') : result.join('')) as T['array'] extends true
      ? string[]
      : string;
  }
}

Selectors.prototype.model = Selector;
