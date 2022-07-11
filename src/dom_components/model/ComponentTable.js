import Component from './Component';
import { toLowerCase } from 'utils/mixins';

const type = 'table';

export default class ComponentTable extends Component {
  get defaults() {
    return {
      ...super.defaults,
      type,
      tagName: type,
      droppable: ['tbody', 'thead', 'tfoot'],
    };
  }

  initialize(o, opt) {
    Component.prototype.initialize.apply(this, arguments);
    const components = this.get('components');
    !components.length && components.add({ type: 'tbody' });
  }
}

ComponentTable.isComponent = el => toLowerCase(el.tagName) === type;
