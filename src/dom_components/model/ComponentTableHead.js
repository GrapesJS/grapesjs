import ComponentTableBody from './ComponentTableBody';
import { toLowerCase } from 'utils/mixins';

const type = 'thead';

export default class ComponentTableHead extends ComponentTableBody {
  get defaults() {
    return {
      ...super.defaults,
      type,
      tagName: type,
    };
  }
}

ComponentTableHead.isComponent = el => toLowerCase(el.tagName) === type;
