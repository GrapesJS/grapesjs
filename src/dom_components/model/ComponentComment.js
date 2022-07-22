import ComponentTextNode from './ComponentTextNode';

export default class ComponentComment extends ComponentTextNode {
  get defaults() {
    return { ...super.defaults };
  }

  toHTML() {
    return `<!--${this.get('content')}-->`;
  }
}

ComponentComment.isComponent = el => {
  if (el.nodeType == 8) {
    return {
      tagName: 'NULL',
      type: 'comment',
      content: el.textContent,
    };
  }
};
