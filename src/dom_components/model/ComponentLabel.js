import Component from './ComponentText';
import { toLowerCase } from 'utils/mixins';

const type = 'label';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      type,
      tagName: type,
      traits: ['id', 'title', 'for']
    }
  },
  {
    isComponent: el => toLowerCase(el.tagName) === type
  }
);
