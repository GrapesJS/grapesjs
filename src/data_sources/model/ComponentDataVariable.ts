import Component from '../../dom_components/model/Component';
import { ToHTMLOptions } from '../../dom_components/model/types';
import { toLowerCase } from '../../utils/mixins';
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

  getInnerHTML(opts: ToHTMLOptions) {
    const { path, value } = this.attributes;
    const val = this.em.DataSources.getValue(path, value);

    return val;
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === DataVariableType;
  }
}
