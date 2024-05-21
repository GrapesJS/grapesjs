import Component from './Component';
import { toLowerCase } from '../../utils/mixins';
import { DraggableDroppableFn } from './types';

export const type = 'head';
const droppable = ['title', 'style', 'base', 'link', 'meta', 'script', 'noscript'];

export default class ComponentHead extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type,
      tagName: type,
      draggable: false,
      highlightable: false,
      droppable: (({ tagName }) => !tagName || droppable.includes(toLowerCase(tagName))) as DraggableDroppableFn,
    };
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === type;
  }
}
