import Component from './Component';
import { toLowerCase } from 'utils/mixins';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      type: 'cell',
      tagName: 'td',
      draggable: ['tr']
    }
  },
  {
    isComponent: el => ['td', 'th'].indexOf(toLowerCase(el.tagName)) >= 0
  }
);
