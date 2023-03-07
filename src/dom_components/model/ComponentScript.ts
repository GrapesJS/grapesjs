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
    };
  }

  static isComponent(el: HTMLImageElement) {
    if (toLowerCase(el.tagName) == type) {
      const result: any = { type };

      if (el.src) {
        result.src = el.src;
        result.onload = el.onload;
      }

      return result;
    }
  }
}
