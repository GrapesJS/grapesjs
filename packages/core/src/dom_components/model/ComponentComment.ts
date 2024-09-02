import ComponentTextNode from './ComponentTextNode';

export default class ComponentComment extends ComponentTextNode {
  get defaults() {
    // @ts-ignore
    return { ...super.defaults };
  }

  toHTML() {
    return `<!--${this.content}-->`;
  }

  static isComponent(el: HTMLElement) {
    if (el.nodeType == 8) {
      return {
        type: 'comment',
        content: el.textContent ?? '',
      };
    }
  }
}
