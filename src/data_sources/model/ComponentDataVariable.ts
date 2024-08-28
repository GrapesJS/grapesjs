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

    return opts.keepVariables ? path : this.em.DataSources.getValue(path, value);
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === DataVariableType;
  }
}
