import Component from '../../dom_components/model/Component';
import { ToHTMLOptions } from '../../dom_components/model/types';
import { stringToPath, toLowerCase } from '../../utils/mixins';
import { DataVariableType } from './DataVariable';


export default class ComponentDataVariable extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type: DataVariableType,
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
    return toLowerCase(el.tagName) === DataVariableType;
  }
}
