import Component from './Component';
import { escape } from 'utils/mixins';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      tagName: '',
      droppable: false,
      layerable: false,
      selectable: false,
      editable: true
    },

    toHTML() {
      const parent = this.parent();
      const cnt = this.get('content');
      return parent && parent.is('script') ? cnt : escape(cnt);
    }
  },
  {
    isComponent(el) {
      var result = '';
      if (el.nodeType === 3) {
        result = {
          type: 'textnode',
          content: el.textContent
        };
      }
      return result;
    }
  }
);
