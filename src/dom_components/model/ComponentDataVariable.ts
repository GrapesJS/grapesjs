import { stringToPath, toLowerCase } from '../../utils/mixins';
import Component from './Component';
import { ToHTMLOptions } from './types';

export const type = 'data-variable';

export default class ComponentDataVariable extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type,
      path: '',
      value: '',
    };
  }

  getInnerHTML(opts: ToHTMLOptions & { keepVariables?: boolean } = {}) {
    const { path, value } = this.attributes;
    const [dsId, drId, key] = stringToPath(path);
    const ds = this.em.DataSources.get(dsId);
    const dr = ds && ds.getRecord(drId);

    return opts.keepVariables ? path : dr ? dr.get(key) : value;
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === type;
  }
}
