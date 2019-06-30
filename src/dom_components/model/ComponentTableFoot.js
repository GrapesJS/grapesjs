import ComponentTableBody from './ComponentTableBody';

export default ComponentTableBody.extend(
  {
    defaults: {
      ...ComponentTableBody.prototype.defaults,
      type: 'tfoot',
      tagName: 'tfoot'
    }
  },
  {
    isComponent(el) {
      let result = '';

      if (el.tagName == 'TFOOT') {
        result = { type: 'tfoot' };
      }

      return result;
    }
  }
);
