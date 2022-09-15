import ComponentTableBody from './ComponentTableBody';
import { toLowerCase } from 'utils/mixins';

const type = 'tfoot';

export default class ComponentTableFoot extends ComponentTableBody {
  get defaults() {
    return {
      ...super.defaults,
      type,
      tagName: type,
    };
  }
}

ComponentTableFoot.isComponent = el => toLowerCase(el.tagName) === type;
