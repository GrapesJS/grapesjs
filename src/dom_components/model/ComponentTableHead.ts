import ComponentTableBody from './ComponentTableBody';
import { toLowerCase } from '../../utils/mixins';

const type = 'thead';

export default class ComponentTableHead extends ComponentTableBody {
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
