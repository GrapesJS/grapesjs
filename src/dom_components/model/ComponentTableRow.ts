import Component from './Component';
import { toLowerCase } from '../../utils/mixins';

const tagName = 'tr';

export default class ComponentTableRow extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      tagName,
      draggable: ['thead', 'tbody', 'tfoot'],
      droppable: ['th', 'td'],
    };
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === tagName;
  }
}
