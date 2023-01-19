import ComponentTextNode from './ComponentTextNode';

export default class ComponentComment extends ComponentTextNode {
  get defaults() {
    // @ts-ignore
    return { ...super.defaults };
  }

  toHTML() {
    return `<!--${this.get('content')}-->`;
  }

  static isComponent(el: HTMLElement) {
    if (el.nodeType == 8) {
      return {
        tagName: 'NULL',
        type: 'comment',
        content: el.textContent,
      };
    }
  }
}

// ComponentComment.isComponent = el => {
//   if (el.nodeType == 8) {
//     return {
//       tagName: 'NULL',
//       type: 'comment',
//       content: el.textContent,
//     };
//   }
// };
