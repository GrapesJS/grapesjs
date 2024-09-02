import Component from './Component';
import { escapeNodeContent } from '../../utils/mixins';

export default class ComponentTextNode extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      tagName: '',
      droppable: false,
      layerable: false,
      selectable: false,
      editable: true,
    };
  }

  toHTML() {
    const { content } = this;
    const parent = this.parent();
    return parent?.is('script') ? content : this.__escapeContent(content);
  }

  __escapeContent(content: string) {
    return escapeNodeContent(content);
  }

  static isComponent(el: HTMLElement) {
    if (el.nodeType === 3) {
      return {
        type: 'textnode',
        content: el.textContent ?? '',
      };
    }
  }
}
