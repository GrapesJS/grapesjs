import Component from './Component';
import { toLowerCase } from 'utils/mixins';

export default class ComponentTableCell extends Component {
  get defaults() {
    return {
      ...super.defaults,
      type: 'cell',
      tagName: 'td',
      draggable: ['tr'],
    };
  }
}

ComponentTableCell.isComponent = el => ['td', 'th'].indexOf(toLowerCase(el.tagName)) >= 0;
