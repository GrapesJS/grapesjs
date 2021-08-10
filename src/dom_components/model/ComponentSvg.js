import Component from './Component';
import { toLowerCase } from 'utils/mixins';

const type = 'svg';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      type,
      tagName: type,
      highlightable: 0,
      resizable: { ratioDefault: 1 }
    },

    getName() {
      let name = this.get('tagName');
      let customName = this.get('custom-name');
      name = name.charAt(0).toUpperCase() + name.slice(1);
      return customName || name;
    }
  },
  {
    isComponent: el => toLowerCase(el.tagName) === type
  }
);
