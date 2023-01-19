import ComponentTableBody from './ComponentTableBody';
import { toLowerCase } from '../../utils/mixins';

const type = 'tfoot';

export default class ComponentTableFoot extends ComponentTableBody {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type,
      tagName: type,
    };
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === type;
  }
}
