import Component from './Component';
import { toLowerCase } from 'utils/mixins';

const tagName = 'tr';

export default class ComponentTableRow extends Component {
  get defaults() {
    return {
      ...super.defaults,
      tagName,
      draggable: ['thead', 'tbody', 'tfoot'],
      droppable: ['th', 'td'],
    };
  }
}

ComponentTableRow.isComponent = el => toLowerCase(el.tagName) === tagName;
