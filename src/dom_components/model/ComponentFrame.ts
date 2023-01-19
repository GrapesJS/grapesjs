import Component from './Component';
import { toLowerCase } from '../../utils/mixins';

const type = 'iframe';

export default class ComponentFrame extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type,
      tagName: type,
      droppable: false,
      resizable: true,
      traits: ['id', 'title', 'src'],
      attributes: { frameborder: '0' },
    };
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === type;
  }
}

// ComponentFrame.isComponent = el => toLowerCase(el.tagName) === type;
