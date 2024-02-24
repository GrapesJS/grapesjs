import { toLowerCase } from '../../utils/mixins';
import Component from './Component';

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

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === type;
  }
}
