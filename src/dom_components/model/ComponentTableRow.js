import Component from './Component';
import { toLowerCase } from 'utils/mixins';

const tagName = 'tr';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      tagName,
      draggable: ['thead', 'tbody', 'tfoot'],
      droppable: ['th', 'td']
    }
  },
  {
    isComponent: el => toLowerCase(el.tagName) === tagName
  }
);
