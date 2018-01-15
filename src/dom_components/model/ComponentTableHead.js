const ComponentTableBody = require('./ComponentTableBody');

module.exports = ComponentTableBody.extend(
  {
    defaults: {
      ...ComponentTableBody.prototype.defaults,
      type: 'thead',
      tagName: 'thead'
    }
  },
  {
    isComponent(el) {
      let result = '';

      if (el.tagName == 'THEAD') {
        result = { type: 'thead' };
      }

      return result;
    }
  }
);
