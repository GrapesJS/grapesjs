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
    const parent = this.parent();
    const content = this.get('content')!;
    return parent?.is('script') ? content : this.__escapeContent(content);
  }

  __escapeContent(content: string) {
    return escapeNodeContent(content);
  }

  static isComponent(el: HTMLElement) {
    if (el.nodeType === 3) {
      return {
        type: 'textnode',
        content: el.textContent,
      };
    }
  }
}

// ComponentTextNode.isComponent = el => {
//   var result = '';
//   if (el.nodeType === 3) {
//     result = {
//       type: 'textnode',
//       content: el.textContent,
//     };
//   }
//   return result;
// };
