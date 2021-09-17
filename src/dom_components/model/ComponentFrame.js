import Component from './Component';
import { toLowerCase } from 'utils/mixins';

const type = 'iframe';

export default Component.extend(
  {
    defaults() {
      return {
        ...Component.prototype.defaults,
        type,
        tagName: type,
        droppable: false,
        resizable: true,
        traits: ['id', 'title', 'src'],
        attributes: { frameborder: '0' }
      };
    }
  },
  {
    isComponent: el => toLowerCase(el.tagName) === type
  }
);
