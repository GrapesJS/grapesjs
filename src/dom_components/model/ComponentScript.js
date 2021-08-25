import Component from './Component';
import { toLowerCase } from 'utils/mixins';

const type = 'script';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      type,
      tagName: type,
      droppable: false,
      draggable: false,
      layerable: false
    }
  },
  {
    isComponent(el) {
      if (toLowerCase(el.tagName) == type) {
        const result = { type };

        if (el.src) {
          result.src = el.src;
          result.onload = el.onload;
        }

        return result;
      }
    }
  }
);
