import Component from './Component';

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
    isComponent(el) {
      let result = '';
      const tag = el.tagName;

      if (tag == 'TD' || tag == 'TH') {
        result = {
          type: 'cell',
          tagName: tag.toLowerCase()
        };
      }

      return result;
    }
  }
);
