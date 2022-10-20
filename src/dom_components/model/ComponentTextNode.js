import Component from './Component';
import { escapeNodeContent } from 'utils/mixins';

export default class ComponentTextNode extends Component {
  get defaults() {
    return {
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
    const content = this.get('content');
    return parent?.is('script') ? content : this.__escapeContent(content);
  }

  __escapeContent(content) {
    return escapeNodeContent(content);
  }
}

ComponentTextNode.isComponent = el => {
  var result = '';
  if (el.nodeType === 3) {
    result = {
      type: 'textnode',
      content: el.textContent,
    };
  }
  return result;
};
