import Component from './Component';
import { toLowerCase } from '../../utils/mixins';

const type = 'script';

export default class ComponentScript extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type,
      tagName: type,
      droppable: false,
      draggable: false,
      layerable: false,
      highlightable: false,
    };
  }

  static isComponent(el: HTMLScriptElement) {
    return toLowerCase(el.tagName) === type;
  }
}
