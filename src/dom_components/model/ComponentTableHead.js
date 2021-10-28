import ComponentTableBody from './ComponentTableBody';
import { toLowerCase } from 'utils/mixins';

const type = 'thead';

export default ComponentTableBody.extend(
  {
    defaults: {
      ...ComponentTableBody.prototype.defaults,
      type,
      tagName: type
    }
  },
  {
    isComponent: el => toLowerCase(el.tagName) === type
  }
);
