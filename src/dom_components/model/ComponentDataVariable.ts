import { toLowerCase } from '../../utils/mixins';
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
    return opts.keepVariables ? path : this.em.DataSources.getValue(path, value);
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === type;
  }
}
