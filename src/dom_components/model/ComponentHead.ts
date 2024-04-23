import Component from './Component';
import { toLowerCase } from '../../utils/mixins';

export const type = 'head';

export default class ComponentHead extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type,
      tagName: type,
      draggable: false,
      droppable: ['title', 'style', 'base', 'link', 'meta', 'script', 'noscript'],
    };
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === type;
  }
}
