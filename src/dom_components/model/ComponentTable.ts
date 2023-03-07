import Component from './Component';
import { toLowerCase } from '../../utils/mixins';

const type = 'table';

export default class ComponentTable extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type,
      tagName: type,
      droppable: ['tbody', 'thead', 'tfoot'],
    };
  }

  initialize(props: any, opts: any) {
    super.initialize(props, opts);
    const components = this.get('components')!;
    !components.length && components.add({ type: 'tbody' });
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === type;
  }
}
