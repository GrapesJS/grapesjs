import Component from './Component';
import { toLowerCase } from '../../utils/mixins';
import { ComponentOptions, ComponentProperties } from './types';

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

  constructor(props: ComponentProperties = {}, opt: ComponentOptions) {
    super(props, opt);
    const components = this.get('components')!;
    !components.length && components.add({ type: 'tbody' });
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === type;
  }
}
