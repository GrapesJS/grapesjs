import Component from './Component';
import { toLowerCase } from 'utils/mixins';

const type = 'script';

export default class ComponentScript extends Component {
  get defaults() {
    return {
      ...super.defaults,
      type,
      tagName: type,
      droppable: false,
      draggable: false,
      layerable: false,
    };
  }
}

ComponentScript.isComponent = el => {
  if (toLowerCase(el.tagName) == type) {
    const result = { type };

    if (el.src) {
      result.src = el.src;
      result.onload = el.onload;
    }

    return result;
  }
};
